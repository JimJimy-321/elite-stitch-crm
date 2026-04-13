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

        const { branchId, phoneId, otpCode } = await req.json();

        if (!branchId || !phoneId || !otpCode) {
            return NextResponse.json({ success: false, error: 'Missing branchId, phoneId, or otpCode' }, { status: 400 });
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
