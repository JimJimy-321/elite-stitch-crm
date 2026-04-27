import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Servicio para la gestión de campañas de marketing, promociones y redenciones
 * SastrePro - Marketing Module
 */
export const marketingService = {
    /**
     * Obtener todas las promociones de la organización con estadísticas de rendimiento
     */
    async getPromotions(orgId: string) {
        const { data: promotions, error } = await supabase
            .from('promotions')
            .select(`
                *,
                branch:branches(name)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Enriquecer con estadísticas reales de ventas y prendas
        const enrichedPromos = await Promise.all(promotions.map(async (promo: any) => {
            // 1. Redenciones (Leads que se registraron)
            const { count: claimsCount } = await supabase
                .from('reward_redemptions')
                .select('*', { count: 'exact', head: true })
                .eq('promotion_id', promo.id);

            // 2. Tickets (Ventas reales donde se aplicó el código)
            const { data: tickets } = await supabase
                .from('tickets')
                .select('id, total_amount, ticket_items(id)')
                .eq('promotion_id', promo.id);

            const redemptionCount = tickets?.length || 0;
            const revenueGenerated = tickets?.reduce((acc, t: any) => acc + (t.total_amount || 0), 0) || 0;
            const garmentCount = tickets?.reduce((acc, t: any) => acc + (t.ticket_items?.length || 0), 0) || 0;

            return {
                ...promo,
                claims_count: claimsCount || 0,
                redemption_count: redemptionCount,
                revenue_generated: revenueGenerated,
                garment_count: garmentCount
            };
        }));

        return enrichedPromos;
    },

    /**
     * Obtener una promoción pública (para la landing de regalo)
     */
    async getPromotionPublic(promoId: string) {
        const { data, error } = await supabase
            .from('promotions')
            .select('*, branch:branches(id, name, address)')
            .eq('id', promoId)
            .single();

        if (error) {
            console.error('[MARKETING_SERVICE] Error fetching public promo:', error);
            return null;
        }
        return data;
    },

    /**
     * Registrar un nuevo cliente o actualizar uno existente y reclamar recompensa
     */
    async claimReward(promoId: string, clientData: { full_name: string, phone: string, branch_id?: string }) {
        const { data, error } = await supabase.rpc('claim_promotion_reward', {
            p_promo_id: promoId,
            p_full_name: clientData.full_name,
            p_phone: clientData.phone,
            p_branch_id: clientData.branch_id
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        return { success: true, clientId: data.client_id };
    },

    /**
     * Gestión de Plantillas (marketing_templates)
     */
    async getTemplates(orgId: string) {
        const { data, error } = await supabase
            .from('marketing_templates')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async saveTemplate(template: any) {
        const { data, error } = await supabase
            .from('marketing_templates')
            .upsert({
                ...template,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createTemplate(template: any) {
        return this.saveTemplate(template);
    },

    async updateTemplate(id: string, updates: any) {
        const { data, error } = await supabase
            .from('marketing_templates')
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

    async deleteTemplate(id: string) {
        const { error } = await supabase
            .from('marketing_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async createPromotion(promotion: any) {
        const { data, error } = await supabase
            .from('promotions')
            .insert({
                ...promotion,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePromotion(id: string) {
        const { error } = await supabase
            .from('promotions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
