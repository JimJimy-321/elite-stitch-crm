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

        // 1. Obtener el contexto del chat (sucursal, teléfono, credenciales) usando el RPC seguro
        const { data: context, error: contextError } = await supabase
            .rpc('get_chat_context', { p_conversation_id: conversationId })
            .single();

        if (contextError || !context) {
            console.error('[SEND_API] Error obteniendo contexto del chat:', contextError);
            return NextResponse.json({ 
                success: false, 
                error: 'No se pudo obtener el contexto de la conversación. Verifique que la sucursal esté configurada.' 
            }, { status: 404 });
        }

        const targetPhone = phone || context.customer_phone;
        const waConfig = (context.wa_phone_number_id && context.wa_access_token) 
            ? { phoneNumberId: context.wa_phone_number_id, accessToken: context.wa_access_token }
            : undefined;

        let result;
        if (mediaUrl && mediaType) {
            result = await whatsappService.sendMediaMessage(targetPhone, mediaUrl, mediaType as any, content, waConfig);
        } else {
            result = await whatsappService.sendTextMessage(targetPhone, content, waConfig);
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
