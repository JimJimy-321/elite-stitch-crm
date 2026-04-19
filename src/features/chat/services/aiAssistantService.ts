import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { whatsappService } from './whatsappService';

/**
 * AI Assistant Service - SastrePro
 * Maneja la lógica de respuestas automáticas e inteligentes.
 */
export const aiAssistantService = {
    /**
     * Detecta si un mensaje requiere intervención de la IA (Consultas de estatus, etc)
     */
    shouldRespond(content: string): boolean {
        const keywords = ['estatus', 'status', 'pedido', 'orden', 'como va', 'mi ropa', 'listo', 'entrega', 'deuda', 'cuanto debo', 'saldo'];
        const lower = content.toLowerCase();
        // Evitar responder a saludos genéricos si no hay keywords
        return keywords.some(k => lower.includes(k));
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
                .select('id, wa_access_token, wa_phone_number_id, metadata, organization_id')
                .eq('wa_phone_number_id', phoneNumberId)
                .single();

            if (bErr || !branch) {
                console.error('[AI_ASSISTANT] Branch not found for ID:', phoneNumberId, bErr);
                return null;
            }

            console.log(`[AI_ASSISTANT] Branch encontrada: ${branch.id}`);

            // Verificar si el asistente está activo en esta sucursal (metadata.ai_enabled)
            // Por defecto activo si no existe la propiedad
            const aiEnabled = branch.metadata?.ai_enabled !== false; 
            if (!aiEnabled) {
                console.log('[AI_ASSISTANT] Asistente desactivado para esta sucursal');
                return null;
            }

            // 2. Buscar Cliente por teléfono (Usando el número completo de WhatsApp)
            // La RPC ahora maneja la normalización internamente
            const { data: clients, error: cErr } = await supabase.rpc('get_client_by_phone_secure', {
                p_phone: phone,
                p_org_id: branch.organization_id,
                p_branch_id: branch.id
            });

            const client = clients?.[0];

            if (cErr || !client) {
                console.log(`[AI_ASSISTANT] Cliente no encontrado para el teléfono: ${phone}`, cErr);
                return null; 
            }

            console.log(`[AI_ASSISTANT] Cliente identificado: ${client.full_name} (ID: ${client.id})`);

            // 3. Buscar Tickets Activos o recientes
            // Buscamos en toda la organización para este cliente
            const { data: tickets, error: tErr } = await supabase.rpc('get_client_tickets_secure', {
                p_client_id: client.id
            });

            if (tErr || !tickets || tickets.length === 0) {
                console.log(`[AI_ASSISTANT] No se encontraron pedidos para el cliente: ${client.id}`);
                const noOrdersMsg = `¡Hola ${client.full_name}! 👋 Verifiqué en nuestro sistema y no tienes pedidos activos o recientes con nosotros en este momento. Si acabas de dejar algo, es posible que aún lo estemos registrando.`;
                return await this.sendAndLog(phone, noOrdersMsg, client.id, branch);
            }

            console.log(`[AI_ASSISTANT] Encontrados ${tickets.length} pedidos para el cliente.`);

            // 4. Construir Respuesta
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

            // 5. Enviar y Registrar
            return await this.sendAndLog(phone, responseText, client.id, branch);

        } catch (error) {
            console.error('[AI_ASSISTANT] Critical Error:', error);
            return null;
        }
    },

    /**
     * Helper para enviar el mensaje por WhatsApp y registrarlo en el historial de chat
     */
    async sendAndLog(phone: string, text: string, clientId: string, branch: any) {
        // Enviar vía API de Meta
        const sendResult = await whatsappService.sendTextMessage(
            phone,
            text,
            { accessToken: branch.wa_access_token, phoneNumberId: branch.wa_phone_number_id }
        );

        if (!sendResult.success) {
            console.error('[AI_ASSISTANT] Error enviando WhatsApp:', sendResult.error);
            return null;
        }

        // Buscar conversación activa para registrar el mensaje
        const { data: conversation } = await supabase
            .from('chat_conversations')
            .select('id')
            .eq('client_id', clientId)
            .eq('status', 'active')
            .maybeSingle();

        if (conversation) {
            // Guardar en DB como rol 'bot'
            await supabase.from('chat_messages').insert({
                conversation_id: conversation.id,
                sender_role: 'bot',
                content: text,
                status: 'sent',
                whatsapp_id: sendResult.data?.messages?.[0]?.id
            });

            // Actualizar la conversación
            await supabase
                .from('chat_conversations')
                .update({
                    last_message_content: text,
                    last_message_at: new Date().toISOString()
                })
                .eq('id', conversation.id);
        }

        return sendResult;
    }
};
