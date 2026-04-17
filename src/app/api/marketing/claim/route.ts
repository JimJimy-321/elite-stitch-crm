import { NextRequest, NextResponse } from 'next/server';
import { marketingService } from '@/features/dashboard/services/marketingService';
import { whatsappService } from '@/features/chat/services/whatsappService';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { promoId, full_name, phone, branch_id } = body;

        if (!promoId || !full_name || !phone) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        // 1. Registrar la redención en la DB
        // Nota: En un entorno real, usaría el service desde el server
        const result = await marketingService.claimReward(promoId, { full_name, phone, branch_id });

        // 2. Obtener detalles de la promo para el mensaje
        const promo = await marketingService.getPromotionPublic(promoId);

        if (promo) {
            // 3. Intentar enviar WhatsApp
            // Obtenemos configuración de la sucursal o centro
            const supabase = await createClient();
            const { data: branch } = await supabase
                .from('branches')
                .select('whatsapp_phone_number_id, whatsapp_access_token')
                .eq('id', branch_id)
                .maybeSingle();

            const waConfig = (branch?.whatsapp_phone_number_id && branch?.whatsapp_access_token) 
                ? { phoneNumberId: branch.whatsapp_phone_number_id, accessToken: branch.whatsapp_access_token }
                : undefined;

            const discountText = promo.discount_type === 'percentage' 
                ? `${promo.discount_value}%` 
                : `$${promo.discount_value}`;

            const message = `¡Hola ${full_name}! 👋\n\nGracias por registrarte en SastrePro. Aquí tienes tu recompensa por visitarnos:\n\n✨ *${promo.name}*\n🎟️ Código: *${promo.discount_code}*\n🎁 Beneficio: *${discountText} de Descuento*\n\nMuestra este mensaje en caja para hacerlo válido. ¡Te esperamos! 🧵✨`;

            try {
                await whatsappService.sendTextMessage(phone, message, waConfig);
            } catch (waError) {
                console.error('Error enviando WhatsApp automatizado:', waError);
                // No bloqueamos la respuesta exitosa si falla el WhatsApp
            }
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error in marketing claim API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
