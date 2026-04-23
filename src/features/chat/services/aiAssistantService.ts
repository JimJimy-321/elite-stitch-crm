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
                .select('id, wa_access_token, wa_phone_number_id, metadata, organization_id, name, business_hours, address')
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

            const systemPrompt = `Eres el asistente virtual de la sastrería "${branch.name}".
            
REGLAS:
1. Usa el historial para dar seguimiento. No repitas saludos largos.
2. Si preguntan por estatus de ropa o deuda, USA la herramienta "find_tickets".
3. PRIVACIDAD: Si el teléfono no coincide con la nota encontrada, pide el número de Nota/Ticket exacto para dar detalles.
4. Invita siempre a visitarnos en ${branch.address}.
5. Sé breve (máximo 2 párrafos).

DATOS SUCURSAL:
- Dirección: ${branch.address}
- Horarios: ${JSON.stringify(branch.business_hours)}

SERVICIOS:
${servicesContext}

CONOCIMIENTO: ${agentConfig?.knowledge_base || ''}`;

            const { text } = await generateText({
                model: googleProvider('gemini-2.5-flash') as any,
                system: systemPrompt,
                messages: [
                    ...history,
                    { role: 'user', content }
                ] as any,
                tools: {
                    find_tickets: tool({
                        description: 'Busca el estatus de las notas. Úsalo si preguntan por su ropa o deuda.',
                        parameters: z.object({
                            ticket_number: z.string().optional().describe('Número de nota'),
                        }),
                        execute: async ({ ticket_number }: { ticket_number?: string }) => {
                            return await aiAssistantTools.findTickets({
                                ticket_number,
                                sender_phone: phone,
                                branch_id: branch.id,
                                organization_id: branch.organization_id
                            });
                        },
                    } as any),
                },
                maxSteps: 5,
            } as any);

            if (!text) throw new Error('No response from AI');

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
