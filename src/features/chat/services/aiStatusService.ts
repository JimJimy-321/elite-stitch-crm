import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * AI Status Service - SastrePro
 * Especializado en interpretar y responder consultas sobre el estado de los pedidos (tickets).
 */
export const aiStatusService = {
    /**
     * Procesa una consulta de estatus usando IA para dar una respuesta personalizada
     */
    async getSmartStatus(clientId: string, branchId: string, query: string, clientName: string) {
        try {
            // 1. Obtener datos reales de los tickets
            const { data: tickets, error: tErr } = await supabase.rpc('get_client_tickets_secure', {
                p_client_id: clientId,
                p_branch_id: branchId
            });

            if (tErr) throw tErr;

            // 2. Construir el contexto de los tickets para la IA
            const ticketsContext = tickets && tickets.length > 0 
                ? tickets.map((t: any) => ({
                    numero: t.ticket_number,
                    estatus: this.translateStatus(t.status),
                    prendas: (t.ticket_items as any[])?.map(i => i.garment_name).join(', ') || 'Prendas varias',
                    saldo: t.balance_due,
                    fecha_entrega: t.estimated_delivery_date,
                    notas: t.notes
                }))
                : [];

            // 3. Prompt para que la IA responda de forma natural
            const systemPrompt = `Eres el Asistente de Estatus de SastrePro. 
Tu tarea es informar al cliente ${clientName} sobre el estado de sus pedidos de forma amable y profesional.

Datos Actuales del Sistema:
${ticketsContext.length > 0 ? JSON.stringify(ticketsContext, null, 2) : 'No se encontraron pedidos activos.'}

Instrucciones:
1. Si hay pedidos, descr\u00edbelos detalladamente pero de forma legible.
2. Si un pedido est\u00e1 "LISTO PARA ENTREGA", an\u00edmalos a pasar por \u00e9l. Menciona si hay saldo pendiente.
3. Si no hay pedidos, responde con cortes\u00eda indicando que no hay registros actuales.
4. Mant\u00e9n un tono servicial y usa emojis.
5. Responde SIEMPRE en espa\u00f1ol.`;

            const { text } = await generateText({
                model: google('gemini-1.5-flash') as any,
                system: systemPrompt,
                prompt: query,
            });

            return text || 'No pude procesar la consulta en este momento.';

        } catch (error) {
            console.error('[AI_STATUS_SERVICE] Error:', error);
            return null;
        }
    },

    /**
     * Traductor de estados técnicos a etiquetas amigables
     */
    translateStatus(status: string): string {
        const map: Record<string, string> = {
            'received': 'RECIBIDO (EN ESPERA)',
            'processing': 'EN PROCESO (EN TALLER)',
            'pending': 'PENDIENTE (EN TALLER)',
            'ready': 'LISTO PARA ENTREGA ✨',
            'delivered': 'ENTREGADO ✅'
        };
        return map[status] || status.toUpperCase();
    }
};
