import { NextResponse } from 'next/server';
import { whatsappService } from '@/features/chat/services/whatsappService';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { branchId, phoneNumberId, wabaId, accessToken, phoneNumber, metadata } = await req.json();

        if (!branchId || !phoneNumberId) {
            return NextResponse.json({ success: false, error: 'Falta ID de Sede o ID de Teléfono' }, { status: 400 });
        }

        // 1. Registrar en Meta (Solo si hay token)
        if (accessToken) {
            const result = await whatsappService.registerPhone({
                phoneNumberId,
                accessToken
            });

            if (!result.success) {
                return NextResponse.json({ 
                    success: false, 
                    error: 'Error al registrar en Meta', 
                    details: result.data || result.error 
                }, { status: 500 });
            }
        }

        // 2. Obtener metadata actual para fusionar
        const { data: currentBranch } = await supabase
            .from('branches')
            .select('metadata')
            .eq('id', branchId)
            .single();

        const updatedMetadata = {
            ...(currentBranch?.metadata || {}),
            ...(metadata || {})
        };

        // 3. Guardar en la base de datos
        const { error: dbError } = await supabase
            .from('branches')
            .update({
                wa_phone_number_id: phoneNumberId,
                wa_waba_id: wabaId,
                wa_access_token: accessToken,
                wa_phone_number: phoneNumber,
                metadata: updatedMetadata
            })
            .eq('id', branchId);

        if (dbError) {
            console.error('[WA_REGISTER] DB Error:', dbError);
            return NextResponse.json({ success: false, error: 'Error guardando en base de datos' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'WhatsApp configurado correctamente',
            metaResponse: accessToken ? 'Token validado y registrado' : 'IDs guardados (Sin Token)'
        });

    } catch (error: any) {
        console.error('[WA_REGISTER] Unexpected error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
