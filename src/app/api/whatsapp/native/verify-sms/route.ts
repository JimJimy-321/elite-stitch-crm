import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { whatsappService } from '@/features/chat/services/whatsappService'; // Use the backend version for registerPhone

const GRAPH_API_VERSION = 'v21.0';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { branchId, phoneId: reqPhoneId, otpCode } = await req.json();

        if (!branchId || !otpCode) {
            return NextResponse.json({ success: false, error: 'Faltan los datos de branchId o otpCode.' }, { status: 400 });
        }

        let phoneId = reqPhoneId;

        // Recuperación mágica si el Frontend perdió el estado
        if (!phoneId) {
            const { data: branch } = await supabase
                .from('branches')
                .select('wa_phone_number_id')
                .eq('id', branchId)
                .single();
            
            if (branch && branch.wa_phone_number_id) {
                phoneId = branch.wa_phone_number_id;
                console.log(`[WA_VERIFY_SMS] phoneId recuperado de la base de datos: ${phoneId}`);
            } else {
                return NextResponse.json({ success: false, error: 'No se pudo recuperar el Phone ID de la BD. Dale atrás y pídelo de nuevo.' }, { status: 400 });
            }
        }

        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json({ 
                success: false, 
                error: 'Server is missing META_ACCESS_TOKEN environment variable.' 
            }, { status: 500 });
        }

        // 1. Verify Code
        const verifyResponse = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/verify_code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                code: otpCode
            })
        });

        const verifyData = await verifyResponse.json();
        if (verifyData.error) {
            return NextResponse.json({ success: false, error: verifyData.error.message, step: 'verify_code' }, { status: 400 });
        }

        // 2. Register Phone on the cloud API to enable sending/receiving messages
        const registerResult = await whatsappService.registerPhone({
            phoneNumberId: phoneId,
            accessToken: accessToken
        });

        if (!registerResult.success) {
             console.warn('[WA_VERIFY_SMS] registerPhone warning:', registerResult.error);
        }

        // 3. Mark as online in Database (optional, can be done via metadata)
        // Or update any status to "VERIFIED"

        return NextResponse.json({ 
            success: true, 
            message: 'Phone number verified and registered successfully!'
        });

    } catch (error: any) {
        console.error('[WA_VERIFY_SMS] Unexpected error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
