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
                .select('id, total_amount, items(id)')
                .eq('discount_code', promo.discount_code);

            const redemptionCount = tickets?.length || 0;
            const revenueGenerated = tickets?.reduce((acc, t: any) => acc + (t.total_amount || 0), 0) || 0;
            const garmentCount = tickets?.reduce((acc, t: any) => acc + (t.items?.length || 0), 0) || 0;

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
            .select('*')
            .eq('id', promoId)
            .eq('is_active', true)
            .single();

        if (error) return null;
        return data;
    },

    /**
     * Registrar un nuevo cliente o actualizar uno existente y reclamar recompensa
     */
    async claimReward(promoId: string, clientData: { full_name: string, phone: string, branch_id?: string }) {
        const promo = await this.getPromotionPublic(promoId);
        if (!promo) throw new Error("Promoción no válida");

        // Normalizar nombre
        const cleanName = clientData.full_name.trim().toUpperCase();

        // 1. Asegurar que el cliente existe
        let clientId;
        const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('phone', clientData.phone)
            .maybeSingle();

        if (existingClient) {
            clientId = existingClient.id;
        } else {
            const { data: newClient, error: clientErr } = await supabase
                .from('clients')
                .insert({
                    full_name: cleanName,
                    phone: clientData.phone,
                    organization_id: promo.organization_id
                })
                .select('id')
                .single();
            
            if (clientErr) throw clientErr;
            clientId = newClient.id;
        }

        // 2. Registrar la redención
        const { error: redemptionErr } = await supabase
            .from('reward_redemptions')
            .insert({
                promotion_id: promoId,
                client_id: clientId,
                branch_id: clientData.branch_id || promo.branch_id,
                discount_code: promo.discount_code,
                organization_id: promo.organization_id
            });

        if (redemptionErr) throw redemptionErr;

        // 3. Incrementar contador de la promo (opcional si usamos agregados en getPromotions)
        return { success: true, clientId };
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
