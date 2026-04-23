import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { whatsappService } from './whatsappService';
import { generateText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { aiAssistantTools } from './aiAssistantTools';

/**
 * AI Assistant Service - SastrePro
 * Maneja la lógica de respuestas automáticas e inteligentes con Memoria y Herramientas.
 */
export const aiAssistantService = {
    /**
     * Detecta si un mensaje requiere intervención de la IA
     */
    shouldRespond(content: string): boolean {
        const lower = content.toLowerCase();
        return lower.length > 1;
    },

    /**
     * Obtiene el historial reciente de la conversación
     */
    async getConversationHistory(clientId: string, branchId: string): Promise<any[]> {
        try {
            const { data: conversation } = await supabase
                .from('chat_conversations')
                .select('id')
                .eq('client_id', clientId)
                .eq('branch_id', branchId)
                .maybeSingle();

            if (!conversation) return [];

            const { data: messages } = await supabase
                .from('chat_messages')
                .select('sender_role, content')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (!messages) return [];

            return messages.reverse().map(m => ({
                role: m.sender_role === 'client' ? 'user' : 'assistant',
                content: m.content || ''
            }));
        } catch (err) {
            console.error('[AI_HISTORY] Error fetching history:', err);
            return [];
        }
    },

    /**
     * Procesa la consulta del cliente y genera una respuesta basada en datos reales
     */
    async handleIncoming(phone: string, content: string, phoneNumberId: string, whatsappId?: string) {
        if (!this.shouldRespond(content)) return null;

        // 0. Prevención de Duplicados
        if (whatsappId) {
            const { data: existing } = await supabase
                .from('chat_messages')
                .select('id')
                .contains('metadata', { whatsapp_id: whatsappId })
                .limit(1);

            if (existing && existing.length > 0) return null;
        }

        try {
            const { data: agentConfig } = await supabase
                .from('agent_configs')
                .select('*')
                .eq('phone_number_id', phoneNumberId)
                .eq('is_active', true)
                .single();

            const { data: branch, error: bErr } = await supabase
                .from('branches')
                .select('id, wa_access_token, wa_phone_number_id, wa_phone_number, metadata, organization_id, name, business_hours, address')
                .eq('wa_phone_number_id', phoneNumberId)
                .single();

            if (bErr || !branch) return null;

            const aiEnabled = agentConfig?.is_active ?? (branch.metadata?.ai_enabled !== false); 
            if (!aiEnabled) return null;

            const { data: clients } = await supabase.rpc('get_client_by_phone_secure', {
                p_phone: phone,
                p_org_id: branch.organization_id,
                p_branch_id: branch.id
            });

            const client = clients?.[0];
            const history = client ? await this.getConversationHistory(client.id, branch.id) : [];

            const { data: services } = await supabase
                .from('service_catalogs')
                .select('name, price, category')
                .eq('organization_id', branch.organization_id)
                .is('deleted_at', null);

            const servicesContext = services?.map(s => `- ${s.name}: $${s.price}${s.category ? ` (${s.category})` : ''}`).join('\n') || 'Info no disponible.';

            const apiKey = agentConfig?.google_api_key || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            if (!apiKey) throw new Error('Missing Gemini API Key');

            const googleProvider = createGoogleGenerativeAI({ 
                apiKey
            });

            const systemPrompt = `Eres el asistente virtual experto de la sastrería "${branch.name}". Tu objetivo es ayudar a los clientes de forma rápida, amable y eficiente.

REGLAS DE ORO:
1. ESTATUS DE PRENDAS: Si preguntan "¿está lista mi ropa?", "¿cómo va mi pedido?" o similar, USA la herramienta "find_tickets" de inmediato.
2. RESPUESTAS CLARAS: 
   - Prioriza informar sobre prendas en estatus "LISTO" (Ready).
   - Si hay saldo pendiente, menciónalo claramente.
   - Si no hay prendas listas, informa con amabilidad y ofrece que un humano revise el detalle si es urgente.
3. FLUIDEZ: No uses saludos largos ni repetitivos. Ve al grano. 
4. PRIVACIDAD: Si el teléfono no coincide exactamente con el registro, pide el número de nota para continuar.
5. UBICACIÓN: Invita a visitarnos en ${branch.address}.

DATOS SUCURSAL:
- Dirección: ${branch.address}
- Horarios: ${JSON.stringify(branch.business_hours)}

SERVICIOS:
${servicesContext}

INSTRUCCIONES ADICIONALES:
- Responde siempre en español de México.
- Máximo 2-3 párrafos cortos.
- Usa emojis de forma moderada (ej. 🧵, 👔, ✅).
- NUNCA dejes al usuario sin respuesta de texto.

CONOCIMIENTO EXTRA: ${agentConfig?.knowledge_base || ''}`;

            const result = await generateText({
                model: googleProvider('gemini-flash-latest') as any,
                system: systemPrompt,
                messages: [
                    ...history,
                    { role: 'user', content }
                ] as any,
                maxSteps: 5,
                tools: {
                    find_tickets: {
                        description: 'Consulta el estatus de las notas/prendas y saldos pendientes.',
                        parameters: z.object({
                            noteNumber: z.string().optional().describe('Número de nota opcional si el cliente lo proporciona'),
                        }),
                        execute: async ({ noteNumber }: { noteNumber: any }) => {
                            try {
                                // 1. Búsqueda vía RPC (Bypass RLS)
                                const cleanPhone = phone.replace(/\D/g, '');
                                const { data: tickets, error: rpcError } = await supabase.rpc('get_tickets_by_phone_ai', {
                                    p_phone: noteNumber || cleanPhone,
                                    p_branch_id: branch.id
                                });

                                if (rpcError) throw rpcError;

                                // Log para diagnóstico
                                await supabase.from('webhook_logs').insert({
                                    payload: {
                                        type: 'AI_TOOL_TICKETS_RPC',
                                        phone: cleanPhone,
                                        found: tickets?.length || 0,
                                        noteNumber
                                    }
                                });

                                if (!tickets || tickets.length === 0) {
                                    return JSON.stringify({ success: true, data_found: false });
                                }

                                // Mapeo de resultados
                                const results = tickets.map((t: any) => ({
                                    ticket_number: t.ticket_number,
                                    status: t.status,
                                    status_display: t.status === 'ready' ? 'LISTO PARA ENTREGA' : 
                                                    t.status === 'in_progress' ? 'EN TRABAJO' : 
                                                    t.status === 'received' ? 'RECIBIDO' : t.status,
                                    balance_due: t.balance_due,
                                    delivery_date: t.delivery_date,
                                    client_name: t.client_name,
                                    authorized: true
                                }));

                                return JSON.stringify({ success: true, data_found: true, tickets: results });
                            } catch (e: any) {
                                console.error('AI_TOOL_ERROR:', e);
                                return JSON.stringify({ success: false, error: e.message });
                            }
                        }
                    } as any
                }
            } as any);

            const { text } = result;

            if (!text || text.trim() === '') {
                // FALLBACK: Si no hay texto pero se llamaron herramientas, intentar una respuesta genérica basada en el éxito de la herramienta
                const lastStep = result.steps?.[result.steps.length - 1];
                const toolResults = lastStep?.toolResults as any[];
                
                if (toolResults?.some(tr => tr.toolName === 'find_tickets' && tr.result)) {
                   const tr = toolResults.find(tr => tr.toolName === 'find_tickets');
                   const parsed = JSON.parse(tr.result);
                   if (parsed.success && parsed.data_found) {
                       const readyCount = parsed.tickets.filter((t: any) => t.status === 'ready').length;
                       const responseText = readyCount > 0 
                           ? `¡Buenas noticias! He encontrado ${readyCount} prenda(s) lista(s) para entrega. ¿Deseas que te dé los detalles de las notas?`
                           : `He encontrado tus notas pero aún están en proceso. ¿En qué más te puedo ayudar?`;
                       return await this.sendAndLog(phone, responseText, client?.id || '', branch);
                   }
                }

                return await this.handleHandoff(phone, branch, content, client?.id, client?.full_name);
            }

            return await this.sendAndLog(phone, text, client?.id || '', branch);

        } catch (error) {
            console.error('[AI_ASSISTANT] Critical Error:', error);
            // Loguear error para diagnóstico en DB
            await supabase.rpc('log_webhook_payload', {
                p_payload: { 
                    type: 'AI_ERROR',
                    error: error instanceof Error ? error.message : String(error),
                    phone,
                    content
                }
            });
            return null;
        }
    },

    async handleHandoff(phone: string, branch: any, content: string, clientId?: string, clientName?: string) {
        if (clientId) {
            await supabase.from('chat_conversations').update({ 
                metadata: { needs_human: true, last_ai_handoff: new Date().toISOString() }
            }).eq('client_id', clientId).eq('branch_id', branch.id);
        }
        const fallbackMsg = `Hola ${clientName || 'Estimado Cliente'}, le enviaré su solicitud al encargado, un momento por favor.`;
        return await this.sendAndLog(phone, fallbackMsg, clientId || '', branch);
    },

    async sendAndLog(phone: string, text: string, clientId: string, branch: any) {
        const sendResult = await whatsappService.sendTextMessage(phone, text, { 
            accessToken: branch.wa_access_token, 
            phoneNumberId: branch.wa_phone_number_id 
        });

        if (sendResult.success) {
            await supabase.rpc('log_bot_message', {
                p_client_id: clientId || null,
                p_branch_id: branch.id,
                p_content: text,
                p_whatsapp_id: sendResult.data?.messages?.[0]?.id || null
            });
        }
        return sendResult;
    }
};
