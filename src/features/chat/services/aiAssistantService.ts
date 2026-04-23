import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { whatsappService } from './whatsappService';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

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

        const cleanPhone = phone.replace(/\D/g, '');

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

            // 1. Pre-fetch de Tickets (Ahorra pasos de IA y mejora confiabilidad)
            const ticketKeywords = ['prenda', 'ropa', 'estatus', 'nota', 'saldo', 'listo', 'terminado', 'cuanto', 'pago', 'debo', 'ticket', 'pedido'];
            const isTicketQuery = ticketKeywords.some(k => content.toLowerCase().includes(k));
            let preFetchedTickets = null;

            if (isTicketQuery) {
                const { data: tickets } = await supabase.rpc('get_tickets_by_phone_ai', {
                    p_phone: cleanPhone,
                    p_branch_id: branch.id
                });
                if (tickets && tickets.length > 0) {
                    preFetchedTickets = tickets;
                }
            }

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

            const currentDate = new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });

            // Contexto de tickets pre-cargados
            const ticketContext = preFetchedTickets ? 
                `ESTATUS ACTUAL DEL CLIENTE (No necesitas consultar find_tickets): \n${JSON.stringify(preFetchedTickets, null, 2)}` : 
                'No se encontraron prendas pendientes en una búsqueda inicial.';

            const systemPrompt = `Eres el asistente virtual experto de la sastrería "${branch.name}". Tu objetivo es ayudar a los clientes de forma rápida, amable y eficiente.

FECHA ACTUAL: ${currentDate}

REGLAS DE ORO:
1. ESTATUS DE PRENDAS: Si ves información en "ESTATUS ACTUAL DEL CLIENTE", úsala directamente para responder. Si no ves nada ahí pero el cliente pregunta por su ropa, usa "find_tickets".
2. RESPUESTAS TRAS CONSULTAR:
   - Si hay prendas "ready": Dile con alegría que ya puede pasar por ellas.
   - Si hay prendas "processing", "received" o "in_progress": Dile que seguimos trabajando en ellas y menciona la "delivery_date" si es futura.
   - Si tiene saldo pendiente ("balance_due" > 0), recuérdale el monto amablemente.
3. PERSONALIZACIÓN: Si conoces su nombre (${client?.full_name || 'Desconocido'}), úsalo.
4. FLUIDEZ: Sé breve, natural y conversacional. No repitas saludos. No menciones IDs técnicos.
5. NO ENCONTRADO: Si no hay tickets, pide disculpas e informa que un humano revisará el sistema manualmente en un momento.

${ticketContext}

DATOS SUCURSAL:
- Dirección: ${branch.address}
- Horarios: ${JSON.stringify(branch.business_hours)}

SERVICIOS:
${servicesContext}

INSTRUCCIONES ADICIONALES:
- Responde siempre en español de México.
- Máximo 2 párrafos cortos.
- Usa emojis (🧵, ✅).
- Conocimiento extra: ${agentConfig?.knowledge_base || ''}`;

            const result = await generateText({
                model: googleProvider('gemini-2.0-flash') as any,
                system: systemPrompt,
                messages: [
                    ...history,
                    { role: 'user', content }
                ] as any,
                maxSteps: 2,
                tools: {
                    find_tickets: {
                        description: 'Consulta el estatus de las notas/prendas y saldos pendientes (solo si no tienes la info arriba).',
                        parameters: z.object({
                            noteNumber: z.string().optional().describe('Número de nota opcional'),
                        }),
                        execute: async ({ noteNumber }: { noteNumber: any }) => {
                            try {
                                const { data: tickets, error: rpcError } = await supabase.rpc('get_tickets_by_phone_ai', {
                                    p_phone: noteNumber || cleanPhone,
                                    p_branch_id: branch.id
                                });

                                if (rpcError) throw rpcError;
                                return JSON.stringify({ success: true, tickets: tickets || [] });
                            } catch (e: any) {
                                return JSON.stringify({ success: false, error: e.message });
                            }
                        }
                    }
                }
            } as any);

            const { text } = result;

            if (!text || text.trim() === '') {
                // Fallback robusto si la IA no generó texto
                if (preFetchedTickets && preFetchedTickets.length > 0) {
                    const safeResponse = this.formatSafeResponse(preFetchedTickets, client?.full_name);
                    return await this.sendAndLog(phone, safeResponse, client?.id || '', branch);
                }
                return await this.handleHandoff(phone, branch, content, client?.id, client?.full_name);
            }

            return await this.sendAndLog(phone, text, client?.id || '', branch);

        } catch (error: any) {
            console.error('[AI_ASSISTANT] Error:', error);
            
            const errorMsg = error instanceof Error ? error.message : String(error);
            const isQuotaError = errorMsg.toLowerCase().includes('quota') || 
                               errorMsg.toLowerCase().includes('rate limit') ||
                               errorMsg.toLowerCase().includes('429');

            // Intento de Safe Mode ante CUALQUIER error crítico
            const safeModeResponse = await this.getSafeModeResponse(phone, branch.id, client?.full_name);
            if (safeModeResponse) {
                return await this.sendAndLog(phone, safeModeResponse, client?.id || '', branch);
            }

            return await this.handleHandoff(phone, branch, content, client?.id, client?.full_name);
        }
    },

    /**
     * Helper para generar una respuesta basada en datos sin usar la IA (Safe Mode)
     */
    async getSafeModeResponse(phone: string, branchId: string, clientName?: string) {
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            const { data: tickets } = await supabase.rpc('get_tickets_by_phone_ai', {
                p_phone: cleanPhone,
                p_branch_id: branchId
            });

            if (!tickets || tickets.length === 0) return null;

            return this.formatSafeResponse(tickets, clientName);
        } catch (e) {
            console.error('[AI_ASSISTANT] Error in Safe Mode Response:', e);
            return null;
        }
    },

    /**
     * Formatea un listado de tickets en un mensaje legible
     */
    formatSafeResponse(tickets: any[], clientName?: string) {
        const readyCount = tickets.filter((t: any) => t.status === 'ready').length;
        const processingCount = tickets.filter((t: any) => t.status === 'processing' || t.status === 'received' || t.status === 'in_progress').length;
        const greeting = clientName ? `Hola ${clientName}, ` : 'Hola, ';
        
        let responseText = `${greeting}he consultado el sistema sobre sus prendas (Modo de Respaldo). \n\n`;
        if (readyCount > 0) {
            responseText += `✅ Tienes ${readyCount} prenda(s) LISTAS para recoger. \n`;
        }
        if (processingCount > 0) {
            responseText += `⏳ Tienes ${processingCount} prenda(s) aún en proceso. \n`;
        }
        
        const totalBalance = tickets.reduce((acc: number, t: any) => acc + (t.balance_due || 0), 0);
        if (totalBalance > 0) {
            responseText += `💰 Saldo pendiente: $${totalBalance}. \n`;
        }
        
        responseText += `\n¡Te esperamos en la sucursal! 🧵`;
        return responseText;
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
