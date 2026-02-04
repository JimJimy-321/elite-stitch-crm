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
    },

    async getOwners() {
        // Obtenemos organizaciones y sus perfiles de dueño si existen
        const { data, error } = await supabase
            .from('organizations')
            .select(`
                *,
                owner_profile:profiles!profiles_organization_id_fkey(full_name, id)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAdminStats() {
        const [{ count: ownersCount }, { count: botsCount }, { data: organizations }] = await Promise.all([
            supabase.from('organizations').select('*', { count: 'exact', head: true }),
            supabase.from('agent_configs').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('organizations').select('plan_name')
        ]);

        // Simulación de MRR basado en planes
        const planPrices: Record<string, number> = {
            'Mensual': 49,
            'Anual Pro': 399,
            'Enterprise': 999,
            'Trial': 0
        };

        const totalMRR = organizations?.reduce((acc, org) => {
            const price = planPrices[org.plan_name || 'Trial'] || 0;
            return acc + price;
        }, 0) || 0;

        return {
            totalOwners: ownersCount || 0,
            activeBots: botsCount || 0,
            totalMRR: totalMRR,
            uptime: "99.99%"
        };
    },

    async createOwner(ownerData: { name: string, email: string, plan: string, branches: number }) {
        const { data, error } = await supabase
            .from('organizations')
            .insert({
                name: `${ownerData.name} Org`,
                contact_name: ownerData.name,
                contact_email: ownerData.email,
                plan_name: ownerData.plan,
                max_branches: ownerData.branches,
                subscription_status: 'active'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getGlobalConfig(key: string) {
        const { data, error } = await supabase
            .from('global_config')
            .select('*')
            .eq('key', key)
            .single();

        if (error) throw error;
        return data.value;
    },

    async updateGlobalConfig(key: string, value: any) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('global_config')
            .upsert({ key, value, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
