import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const dashboardService = {
    async getTickets() {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
        *,
        client:clients(full_name),
        branch:branches(name)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getClients() {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getBranches() {
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getStats() {
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('status, total_amount');

        if (error) throw error;

        const stats = {
            received: tickets.filter(t => t.status === 'received').length,
            processing: tickets.filter(t => t.status === 'processing').length,
            ready: tickets.filter(t => t.status === 'ready').length,
            delivered: tickets.filter(t => t.status === 'delivered').length,
            totalRevenue: tickets.reduce((acc, t) => acc + Number(t.total_amount || 0), 0)
        };

        return stats;
    }
};
