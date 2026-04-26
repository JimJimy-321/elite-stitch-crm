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
        let branch: any = null;
        let client: any = null;

        try {
            const { data: agentConfig } = await supabase
                .from('agent_configs')
                .select('*')
                .eq('phone_number_id', phoneNumberId)
                .eq('is_active', true)
                .single();

            const { data: branchData, error: bErr } = await supabase
                .from('branches')
                .select('id, wa_access_token, wa_phone_number_id, wa_phone_number, metadata, organization_id, name, business_hours, address')
                .eq('wa_phone_number_id', phoneNumberId)
                .single();
            
            branch = branchData;

            if (bErr || !branch) return null;

            const aiEnabled = agentConfig?.is_active ?? (branch.metadata?.ai_enabled !== false); 
            if (!aiEnabled) return null;

            // 1. Pre-fetch de Tickets
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

            client = clients?.[0];
            const history = client ? await this.getConversationHistory(client.id, branch.id) : [];

            // 2. Fast Path: Emojis y Cierre
            const closureKeywords = ['gracias', 'muchas gracias', 'ok', 'enterado', 'perfecto', 'excelente', 'buen día', 'bye', 'adiós'];
            const isEmojiOnly = /^[\p{Emoji}\s]+$/u.test(content);
            const isShortClosure = content.length < 15 && closureKeywords.some(k => content.toLowerCase().includes(k));

            if (isEmojiOnly || isShortClosure) {
                const closureResponse = isEmojiOnly ? '😊' : '¡De nada! Que tenga un excelente día. 😊';
                return await this.sendAndLog(phone, closureResponse, client?.id || '', branch);
            }

            const { data: services } = await supabase
                .from('service_catalogs')
                .select('name, price')
                .eq('organization_id', branch.organization_id);

            const servicesContext = services?.map(s => `- ${s.name}: $${s.price}`).join('\n') || 'Info no disponible.';

            // 3. Selección de Motor
            const modelName = agentConfig?.ai_model || 'gemini-1.5-flash';
            const apiKey = (agentConfig?.google_api_key || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim();
            if (!apiKey) throw new Error('Missing Gemini API Key');
            
            const google = createGoogleGenerativeAI({ apiKey });
            const aiModel = google(modelName);

            const currentDate = new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });

            let formattedHours = 'Consultar en sucursal';
            try {
                if (branch.business_hours) {
                    const daysMap: any = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' };
                    formattedHours = Object.entries(branch.business_hours as any)
                        .map(([day, info]: [string, any]) => {
                            if (info.closed) return `${daysMap[day]}: Cerrado`;
                            return `${daysMap[day]}: ${info.open} a ${info.close}`;
                        }).join(', ');
                }
            } catch (e) {
                formattedHours = String(branch.business_hours);
            }

            const ticketContext = preFetchedTickets && preFetchedTickets.length > 0 ? 
                `ESTATUS ACTUAL DEL CLIENTE: \n${JSON.stringify(preFetchedTickets.map((t: any) => ({
                    articulo: t.item_name || t.service_name,
                    estado: t.status === 'ready' ? 'LISTO PARA ENTREGA' : 
                            t.status === 'received' ? 'RECIBIDO' : 
                            t.status === 'processing' ? 'EN PROCESO' : 
                            t.status === 'in_progress' ? 'EN TRABAJO' : 'PENDIENTE',
                    fecha_entrega: t.delivery_date
                })), null, 2)}` : 
                'No se encontraron prendas pendientes.';

            const systemPrompt = `Eres el asistente virtual experto de la sastrería "${branch.name}". 
Responde SIEMPRE en español de México, de forma cordial, breve y profesional.

FECHA ACTUAL: ${currentDate}

DATOS DE LA SUCURSAL:
- Dirección: ${branch.address || 'Consultar en sucursal'}
- Horarios de Atención: ${formattedHours}
- Formas de Pago Aceptadas: EN EFECTIVO, TRANSFERENCIA o TARJETA DE CRÉDITO/DÉBITO.

REGLAS CRÍTICAS DE RESPUESTA:
1. PRIVACIDAD: NUNCA menciones montos de dinero, saldos pendientes o cantidades a cobrar. Solo indica si la prenda está lista o en proceso.
2. NATURALIDAD: NUNCA uses términos en inglés como "received" o "ready". 
3. CIERRE DE CONVERSACIÓN (ESTRICTO): Si el cliente agradece o confirma, despídete y no preguntes más.
4. BREVEDAD: Responde en máximo 1 o 2 párrafos cortos. Usa emojis como 🧵, ✅, 📍.

${ticketContext}

SERVICIOS DISPONIBLES:
${servicesContext}`;

            let aiText = '';
            let aiError = null;

            try {
                const result = await generateText({
                    model: aiModel,
                    system: systemPrompt,
                    messages: history.concat([{ role: 'user', content }]) as any,
                });
                aiText = result.text;
            } catch (err: any) {
                aiError = err.message || String(err);
                console.error('[AI_GENERATE_ERROR]', err);
            }

            // Log de la interacción
            try {
                await supabase.from('ai_logs').insert({
                    branch_id: branch.id,
                    client_phone: phone,
                    user_query: content,
                    system_prompt: systemPrompt.substring(0, 1500),
                    ai_response: aiText,
                    ai_error: aiError,
                    metadata: { whatsapp_id: whatsappId, model: modelName, provider: 'google' }
                });
            } catch (e) {
                console.error('[AI_LOG_ERROR]', e);
            }

            if (aiError) {
                const isTicketQueryRelevant = isTicketQuery || content.length < 10;
                if (isTicketQueryRelevant && preFetchedTickets && preFetchedTickets.length > 0) {
                    const safeResponse = this.formatSafeResponse(preFetchedTickets, client?.full_name);
                    return await this.sendAndLog(phone, safeResponse, client?.id || '', branch);
                }
                throw new Error(aiError);
            }

            if (!aiText || aiText.trim() === '') {
                if (preFetchedTickets && preFetchedTickets.length > 0) {
                    const safeResponse = this.formatSafeResponse(preFetchedTickets, client?.full_name);
                    return await this.sendAndLog(phone, safeResponse, client?.id || '', branch);
                }
                return await this.handleHandoff(phone, branch, content, client?.id, client?.full_name);
            }

            return await this.sendAndLog(phone, aiText, client?.id || '', branch);

        } catch (error: any) {
            console.error('[AI_ASSISTANT] Critical Error:', error);
            return await this.handleHandoff(phone, branch, content, client?.id, client?.full_name);
        }
    },

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
