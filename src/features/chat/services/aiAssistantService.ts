import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { whatsappService } from './whatsappService';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * AI Assistant Service - SastrePro
 * Maneja la lógica de respuestas automáticas e inteligentes.
 */
export const aiAssistantService = {
    /**
     * Detecta si un mensaje requiere intervención de la IA
     */
    shouldRespond(content: string): boolean {
        const lower = content.toLowerCase();
        // Respondemos a casi todo si el asistente está activo, 
        // pero priorizamos flujos específicos.
        return lower.length > 1;
    },

    /**
     * Procesa la consulta del cliente y genera una respuesta basada en datos reales
     */
    async handleIncoming(phone: string, content: string, phoneNumberId: string) {
        if (!this.shouldRespond(content)) return null;

        console.log(`[AI_ASSISTANT] Procesando consulta para: ${phone}`);

        try {
            // 1. Obtener Configuración de la Sucursal
            const { data: branch, error: bErr } = await supabase
                .from('branches')
                .select('id, wa_access_token, wa_phone_number_id, metadata, organization_id, name, business_hours')
                .eq('wa_phone_number_id', phoneNumberId)
                .single();

            if (bErr || !branch) {
                console.error('[AI_ASSISTANT] Branch not found for ID:', phoneNumberId, bErr);
                return null;
            }

            // Verificar si el asistente está activo en esta sucursal
            const aiEnabled = branch.metadata?.ai_enabled !== false; 
            if (!aiEnabled) return null;

            // 2. Buscar Cliente por teléfono
            const { data: clients, error: cErr } = await supabase.rpc('get_client_by_phone_secure', {
                p_phone: phone,
                p_org_id: branch.organization_id,
                p_branch_id: branch.id
            });

            const client = clients?.[0];

            if (cErr || !client) {
                console.log(`[AI_ASSISTANT] Cliente no identificado para: ${phone}`);
                // Podríamos generar una respuesta genérica aquí o derivar a humano
                return await this.handleHandoff(phone, branch, "CLIENTE NO IDENTIFICADO");
            }

            // 3. Lógica de Decisión: ¿Es consulta de estatus o general?
            const isStatusQuery = ['estatus', 'status', 'pedido', 'orden', 'mi ropa', 'listo', 'entrega', 'deuda', 'cuanto debo', 'saldo'].some(k => content.toLowerCase().includes(k));

            if (isStatusQuery) {
                return await this.respondStatus(phone, client, branch);
            }

            // 4. Consulta General (IA Inteligente con Gemini)
            return await this.respondGeneral(phone, client, branch, content);

        } catch (error) {
            console.error('[AI_ASSISTANT] Critical Error:', error);
            return null;
        }
    },

    /**
     * Responde a consultas de estatus de pedidos
     */
    async respondStatus(phone: string, client: any, branch: any) {
        const { data: tickets, error: tErr } = await supabase.rpc('get_client_tickets_secure', {
            p_client_id: client.id,
            p_branch_id: branch.id // FILTRO POR SUCURSAL
        });

        if (tErr || !tickets || tickets.length === 0) {
            const noOrdersMsg = `¡Hola ${client.full_name}! 👋 Verifiqué en nuestro sistema y no tienes pedidos activos o recientes con nosotros en este momento. Si acabas de dejar algo, es posible que aún lo estemos registrando.`;
            return await this.sendAndLog(phone, noOrdersMsg, client.id, branch);
        }

        let responseText = `¡Hola ${client.full_name}! 👋 Aquí tienes el estatus de tus pedidos:\n\n`;

        tickets.forEach((ticket: any) => {
            const statusMap: Record<string, string> = {
                'received': '📥 Recibido',
                'processing': '🧵 En Proceso',
                'pending': '🧵 En Proceso',
                'ready': '✨ ¡Listo para Entrega!',
                'delivered': '✅ Entregado'
            };

            const statusLabel = statusMap[ticket.status] || ticket.status;
            const itemsList = (ticket.ticket_items as any[])?.map(i => i.garment_name).join(', ') || 'Prendas';
            
            responseText += `*Orden: ${ticket.ticket_number}*\n`;
            responseText += `🔹 Detalle: ${itemsList}\n`;
            responseText += `🔹 Estatus: ${statusLabel}\n`;
            
            if (ticket.balance_due > 0) {
                responseText += `💰 Saldo Pendiente: $${ticket.balance_due}\n`;
            }
            responseText += `\n`;
        });

        responseText += "Si necesitas algo más, aquí estaré. ¡Buen día!";
        return await this.sendAndLog(phone, responseText, client.id, branch);
    },

    /**
     * Respuesta genérica / inteligente usando Gemini
     */
    async respondGeneral(phone: string, client: any, branch: any, content: string) {
        try {
            // 1. Obtener contexto del catálogo de servicios
            const { data: services } = await supabase
                .from('service_catalogs')
                .select('name, price, category')
                .eq('organization_id', branch.organization_id)
                .is('deleted_at', null);

            const servicesContext = services?.map(s => `- ${s.name}: $${s.price}${s.category ? ` (${s.category})` : ''}`).join('\n') || 'Información de precios no disponible temporalmente.';

            // 2. Construir Prompt del Sistema
            const systemPrompt = `Eres el Asistente IA de "${branch.name}", una sastrer\u00eda profesional de alta costura.
Tu objetivo es ser amable, eficiente y profesional. 
IMPORTANTE: S\u00f3lo responde informaci\u00f3n referente a esta sucursal: ${branch.name}.

Datos de la Sucursal:
- Nombre: ${branch.name}
- Direcci\u00f3n: ${branch.address || 'Consultar por chat'}
- Horarios: ${JSON.stringify(branch.business_hours || 'Lunes a Viernes 9am-7pm, S\u00e1bados 9am-2pm')}

Cat\u00e1logo de Servicios y Precios:
${servicesContext}

Instrucciones:
1. Responde de forma concisa y amable en espa\u00f1ol.
2. Si el cliente pregunta por precios, usa la informaci\u00f3n del cat\u00e1logo.
3. Si el cliente pregunta por algo que no sabes o es muy complejo (ej: quejas graves, solicitudes especiales de dise\u00f1o), indica que un encargado humano lo atender\u00e1 pronto.
4. No inventes precios ni servicios que no est\u00e9n en la lista.
5. El cliente se llama ${client.full_name}.`;

            // 3. Generar respuesta con Gemini
            const { text } = await generateText({
                model: google('gemini-2.0-flash-001') as any,
                system: systemPrompt,
                prompt: content,
            });

            if (!text) throw new Error('No response from AI');

            // 4. Detección de Handoff en el texto generado
            const handoffLower = text.toLowerCase();
            const needsHuman = handoffLower.includes('encargado') || 
                              handoffLower.includes('pronto') || 
                              handoffLower.includes('paciencia') || 
                              handoffLower.includes('atender');

            if (needsHuman) {
                console.log(`[AI_ASSISTANT] Handoff detectado en respuesta de IA para: ${phone}`);
                await this.markForHuman(client.id, branch.id, "AI_SUGGESTED_HANDOFF");
            }

            return await this.sendAndLog(phone, text, client.id, branch);

        } catch (error) {
            console.error('[AI_ASSISTANT_GEMINI] Error:', error);
            // Fallback a handoff si la IA falla
            return await this.handleHandoff(phone, branch, content, client.id, client.full_name);
        }
    },

    /**
     * Marca la conversación para atención humana
     */
    async handleHandoff(phone: string, branch: any, content: string, clientId?: string, clientName?: string) {
        console.log(`[AI_ASSISTANT] Handoff requerido para: ${phone}`);
        
        // Si tenemos cliente, actualizamos su conversación a 'pending'
        if (clientId) {
            await this.markForHuman(clientId, branch.id, "FAILED_OR_COMPLEX");
        }

        // Si la IA fall\u00f3 por completo, enviamos un mensaje de espera
        const fallbackMsg = `Hola ${clientName || 'Estimado Cliente'}, le enviar\u00e9 su solicitud al encargado de la sucursal, perm\u00edtame un momento por favor, gracias.`;
        return await this.sendAndLog(phone, fallbackMsg, clientId || '', branch);
    },

    /**
     * Helper para marcar una conversación como que necesita atención humana
     */
    async markForHuman(clientId: string, branchId: string, reason: string) {
        try {
            await supabase
                .from('chat_conversations')
                .update({ 
                    metadata: { 
                        needs_human: true, 
                        last_ai_handoff: new Date().toISOString(),
                        handoff_reason: reason
                    }
                })
                .eq('client_id', clientId)
                .eq('branch_id', branchId);
        } catch (err) {
            console.error('[AI_ASSISTANT] Error marking for human:', err);
        }
    },

    /**
     * Helper para enviar el mensaje por WhatsApp y registrarlo usando la RPC segura
     */
    async sendAndLog(phone: string, text: string, clientId: string, branch: any) {
        // 1. Enviar vía API de Meta
        const sendResult = await whatsappService.sendTextMessage(
            phone,
            text,
            { accessToken: branch.wa_access_token, phoneNumberId: branch.wa_phone_number_id }
        );

        if (!sendResult.success) {
            console.error('[AI_ASSISTANT] Error enviando WhatsApp:', sendResult.error);
            return null;
        }

        // 2. Registrar en DB usando la RPC log_bot_message (Bypasses RLS)
        const { error: logError } = await supabase.rpc('log_bot_message', {
            p_client_id: clientId,
            p_branch_id: branch.id,
            p_content: text,
            p_whatsapp_id: sendResult.data?.messages?.[0]?.id
        });

        if (logError) {
            console.error('[AI_ASSISTANT] Error registrando mensaje del bot:', logError);
        }

        return sendResult;
    }
};

