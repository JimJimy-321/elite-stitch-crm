import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * AI Status Service - SastrePro
 * Maneja la lógica de respuesta inteligente sobre el estatus de las notas.
 */
export const aiStatusService = {
    /**
     * Responde de forma inteligente sobre el estatus de las notas de un cliente
     */
    async getSmartStatus(clientId: string, branchId: string, query: string, clientName: string) {
        try {
            // 1. Obtener notas activas del cliente
            const { data: orders, error } = await supabase
                .from('tickets')
                .select('id, ticket_number, status, total_amount, balance_due, items, created_at, delivery_date')
                .eq('client_id', clientId)
                .eq('branch_id', branchId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            // 2. Construir contexto para la IA
            const ordersContext = orders && orders.length > 0 
                ? orders.map(o => `- Nota #${o.ticket_number}: ${o.status.toUpperCase()} (Deuda: $${o.balance_due}). Entrega: ${o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : 'Por confirmar'}`).join('\n')
                : 'No tiene notas activas actualmente.';

            // 3. Prompt del sistema
            const systemPrompt = `Eres el Asistente de SastrePro. Tu objetivo es informar al cliente sobre el estatus de sus pedidos de forma amable y profesional.
            
INFORMACIÓN DEL CLIENTE:
- Nombre: ${clientName}
- Notas Recientes:
${ordersContext}

INSTRUCCIONES:
1. Sé muy claro sobre el estatus (PENDIENTE, PROCESO, RECIBIDO, ENTREGADO).
2. Si hay deuda, recuérdalo amablemente.
3. Si no hay notas, invita al cliente a visitarnos.
4. Mantén un tono servicial y usa emojis.
5. Responde SIEMPRE en español.`;

            const { text } = await generateText({
                model: google('gemini-1.5-flash') as any,
                system: systemPrompt,
                prompt: query,
            });

            return text;

        } catch (error) {
            console.error('[AI_STATUS_SERVICE] Error:', error);
            return null;
        }
    }
};
