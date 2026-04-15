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
        // Usamos el cliente con escalación de privilegios (Service Role si está disponible)
        interface WhatsAppContext {
            branch_id: string;
            wa_phone_number_id: string;
            wa_access_token: string;
            wa_waba_id: string;
            customer_phone: string;
        }

        const { data: contextData, error: contextError } = await supabase
            .rpc('get_chat_context', { p_conversation_id: conversationId })
            .single();

        const context = contextData as unknown as WhatsAppContext;

        if (contextError || !context) {
            const errorMsg = contextError?.message || 'Conversación o sucursal no encontrada';
            console.error('[SEND_API] Error obteniendo contexto del chat:', contextError);
            return NextResponse.json({ 
                success: false, 
                error: `Fallo de Contexto: ${errorMsg} (ID: ${conversationId?.substring(0, 8)}...)`,
                details: contextError
            }, { status: 404 });
        }

        const targetPhone = phone || context.customer_phone;
        const waConfig = (context.wa_phone_number_id && context.wa_access_token) 
            ? { phoneNumberId: context.wa_phone_number_id, accessToken: context.wa_access_token }
            : undefined;

        console.log(`[SEND_API] Contexto recuperado para sucursal: ${context.branch_id}. PhoneID: ${waConfig?.phoneNumberId ? '✓' : '✗'}`);

        let result;
        if (mediaUrl && mediaType) {
            result = await whatsappService.sendMediaMessage(targetPhone, mediaUrl, mediaType as any, content, waConfig);
        } else {
            result = await whatsappService.sendTextMessage(targetPhone, content, waConfig);
        }

        if (!result.success) {
            console.error('[SEND_API] WhatsApp API Error Payload:', JSON.stringify(result.data, null, 2));
            return NextResponse.json({ 
                success: false, 
                error: 'Error en API de WhatsApp', 
                message: (result.data as any)?.error?.message || 'Error desconocido',
                details: result.data 
            }, { status: 500 });
        }

        // 2. Insertar en base de datos usando el cliente de webhook (bypass RLS local)
        const waData = result.data as any;
        const waMsgId = waData.messages?.[0]?.id;

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
