import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/features/chat/services/whatsappService';
import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';

export async function POST(request: NextRequest) {
    try {
        const { conversationId, content, phone, mediaUrl, mediaType } = await request.json();

        console.log(`[SEND_API] Solicitud recibida: Conv=${conversationId}, Phone=${phone}, Content="${content?.substring(0, 20)}..."`);

        if (!phone) {
            console.error('[SEND_API] Error: Phone is missing in request body');
            return NextResponse.json({ success: false, error: 'Phone is required' }, { status: 400 });
        }

        // 1. Obtener la sucursal y sus credenciales de WhatsApp
        const { data: convData, error: convError } = await supabase
            .from('chat_conversations')
            .select('branch_id')
            .eq('id', conversationId)
            .single();

        if (convError || !convData?.branch_id) {
            console.error('[SEND_API] Error obteniendo sucursal de la conversación:', convError);
            return NextResponse.json({ success: false, error: 'Conversación o sucursal no encontrada' }, { status: 404 });
        }

        const { data: branch, error: branchError } = await supabase
            .from('branches')
            .select('wa_phone_number_id, wa_access_token')
            .eq('id', convData.branch_id)
            .single();

        if (branchError) {
            console.error('[SEND_API] Error obteniendo credenciales de sucursal:', branchError);
        }

        const waConfig = (branch?.wa_phone_number_id && branch?.wa_access_token) 
            ? { phoneNumberId: branch.wa_phone_number_id, accessToken: branch.wa_access_token }
            : undefined;

        let result;
        if (mediaUrl && mediaType) {
            result = await whatsappService.sendMediaMessage(phone, mediaUrl, mediaType as any, content, waConfig);
        } else {
            result = await whatsappService.sendTextMessage(phone, content, waConfig);
        }

        if (!result.success) {
            console.error('[SEND_API] WhatsApp API Error:', result.error);
            return NextResponse.json({ success: false, error: 'Error en API de WhatsApp', details: result.error }, { status: 500 });
        }

        // 2. Insertar en base de datos usando el cliente de webhook (bypass RLS local)
        const waMsgId = result.data.messages?.[0]?.id;

        const { data: message, error: dbError } = await supabase
            .rpc('log_outgoing_message', {
                p_conversation_id: conversationId,
                p_content: content || (mediaUrl ? 'Multimedia' : ''),
                p_media_url: mediaUrl || null,
                p_media_type: mediaType || null,
                p_wa_msg_id: waMsgId
            });

        if (dbError) {
            console.error('[SEND_API] DB Insert Error:', dbError);
        }

        return NextResponse.json({ success: true, message, waData: result.data });
    } catch (error) {
        console.error('[SEND_API] Internal Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
