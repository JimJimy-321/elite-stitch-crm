import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GRAPH_API_VERSION = 'v21.0';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { branchId, phoneNumber } = await req.json();

        if (!branchId || !phoneNumber) {
            return NextResponse.json({ success: false, error: 'Missing branchId or phoneNumber' }, { status: 400 });
        }

        const wabaId = process.env.META_WABA_ID;
        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!wabaId || !accessToken) {
            return NextResponse.json({ 
                success: false, 
                error: 'Server is missing META_WABA_ID or META_ACCESS_TOKEN environment variables.' 
            }, { status: 500 });
        }

        // 1. Add Phone to WABA
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const cc = cleanPhone.startsWith('52') ? '52' : '52'; 
        const number = cleanPhone.startsWith('52') ? cleanPhone.substring(2) : cleanPhone;

        const addPhoneResponse = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/phone_numbers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                cc,
                phone_number: number,
                verified_name: "SastrePro Sede" // Meta requiere este campo obligatorio
            })
        });

        const addPhoneData = await addPhoneResponse.json();
        if (addPhoneData.error) {
            const userMsg = addPhoneData.error.error_user_msg || addPhoneData.error.message;
            return NextResponse.json({ success: false, error: userMsg, step: 'add_phone' }, { status: 400 });
        }

        const phoneId = addPhoneData.id;

        // 2. Request SMS
        const reqSmsResponse = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                messaging_method: 'SMS',
                locale: 'es_ES'
            })
        });

        const reqSmsData = await reqSmsResponse.json();
        if (reqSmsData.error) {
            const userMsg = reqSmsData.error.error_user_msg || reqSmsData.error.message;
            return NextResponse.json({ success: false, error: userMsg, step: 'request_sms' }, { status: 400 });
        }

        // 3. Save partially in database
        const { error: dbError } = await supabase
            .from('branches')
            .update({
                wa_phone_number_id: phoneId,
                wa_waba_id: wabaId,
                wa_phone_number: phoneNumber
                // wa_access_token not saved anymore for security
            })
            .eq('id', branchId);

        if (dbError) {
            console.error('[WA_REQ_SMS] DB Error:', dbError);
        }

        return NextResponse.json({ 
            success: true, 
            phoneId: phoneId, // return it so frontend can hold it in state if needed
            message: 'SMS requested successfully'
        });

    } catch (error: any) {
        console.error('[WA_REQ_SMS] Unexpected error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
