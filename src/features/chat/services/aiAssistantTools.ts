import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';

/**
 * AI Assistant Tools - SastrePro
 * Provee funciones que la IA puede llamar para obtener datos reales.
 */
export const aiAssistantTools = {
    /**
     * Busca tickets por número o por el teléfono del cliente.
     * Implementa lógica de privacidad: si el teléfono no coincide, restringe info.
     */
    async findTickets(params: { ticket_number?: string, sender_phone: string, branch_id: string, organization_id: string }) {
        const { ticket_number, sender_phone, branch_id, organization_id } = params;

        try {
            let query = supabase
                .from('tickets')
                .select(`
                    id, 
                    ticket_number, 
                    status, 
                    total_amount, 
                    balance_due, 
                    delivery_date, 
                    created_at,
                    notes,
                    client:clients(id, full_name, phone)
                `)
                .eq('branch_id', branch_id);

            if (ticket_number) {
                // Limpiar el número de nota (quitar #, etc)
                const cleanTicket = ticket_number.replace(/\D/g, '');
                query = query.eq('ticket_number', cleanTicket);
            } else {
                // Buscar por teléfono del remitente si no hay número de nota
                // Usamos una lógica similar a la de identificación de clientes
                const basePhone = sender_phone.slice(-10);
                query = query.filter('client.phone', 'ilike', `%${basePhone}%`);
            }

            const { data: tickets, error } = await query.order('created_at', { ascending: false }).limit(5);

            if (error) throw error;
            if (!tickets || tickets.length === 0) {
                return { 
                    found: false, 
                    message: ticket_number 
                        ? `No encontré ninguna nota con el número ${ticket_number}.` 
                        : "No encontré notas registradas a tu número de teléfono." 
                };
            }

            // Lógica de Privacidad
            const cleanSenderPhone = sender_phone.replace(/\D/g, '').slice(-10);
            
            const results = tickets.map(t => {
                const clientPhone = (t.client as any)?.phone?.replace(/\D/g, '').slice(-10) || '';
                const isOwner = clientPhone === cleanSenderPhone;
                const providedTicketMatch = ticket_number && t.ticket_number === ticket_number.replace(/\D/g, '');

                // Si el teléfono coincide O proporcionó el número de nota exacto, tiene acceso completo
                if (isOwner || providedTicketMatch) {
                    return {
                        ticket_number: t.ticket_number,
                        status: t.status,
                        delivery_date: t.delivery_date,
                        balance_due: t.balance_due,
                        items: t.notes, // Podríamos traer items reales si fuera necesario
                        authorized: true,
                        client_name: (t.client as any)?.full_name
                    };
                } else {
                    // Si NO coincide el teléfono y NO proporcionó la nota (aunque la hayamos encontrado por alguna razón extraña)
                    // O si estamos en "modo búsqueda por teléfono" y el teléfono no es el suyo.
                    return {
                        ticket_number: t.ticket_number,
                        status: "RESTRINGIDO",
                        message: "Por seguridad, para ver detalles de esta nota necesito que me confirmes el número de Ticket exacto ya que tu teléfono no coincide con el registro.",
                        authorized: false
                    };
                }
            });

            return { found: true, tickets: results };

        } catch (error) {
            console.error('[AI_TOOLS] Error finding tickets:', error);
            return { found: false, error: "Error interno al buscar la información." };
        }
    }
};
