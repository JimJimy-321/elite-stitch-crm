import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface AgentConfig {
    id: string;
    organization_id: string;
    branch_id: string;
    phone_number_id: string;
    is_active: boolean;
    system_prompt: string;
    knowledge_base: string;
    welcome_message: string;
    response_style: string;
    google_api_key: string;
}

export const aiAgentService = {
    async getConfigs(orgId: string) {
        const { data, error } = await supabase
            .from('agent_configs')
            .select('*')
            .eq('organization_id', orgId);
            
        if (error) throw error;
        return data as AgentConfig[];
    },

    async updateConfig(id: string, updates: Partial<AgentConfig>) {
        const { data, error } = await supabase
            .from('agent_configs')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createConfig(config: Omit<AgentConfig, 'id'>) {
        const { data, error } = await supabase
            .from('agent_configs')
            .insert([config])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
