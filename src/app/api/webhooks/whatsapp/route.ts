import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/features/chat/services/chatService';
import { aiAssistantService } from '@/features/chat/services/aiAssistantService';
import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';

// Token de verificación configurado en el Dashboard de Meta
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'sastrepro_verify_token';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return new Response(challenge, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        } else {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }

    return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log del payload para depuración
        await supabase.rpc('log_webhook_payload', { p_payload: body });

        // Verificar que es un evento de WhatsApp
        if (body.object === 'whatsapp_business_account') {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const message = body.entry[0].changes[0].value.messages[0];
                const metadata = body.entry[0].changes[0].value.metadata;
                const businessPhone = metadata?.display_phone_number;
                const from = message.from; // Número de teléfono del remitente
                const type = message.type;
                
                // DETECCIÓN DE ECO (Mensaje enviado desde el celular)
                // Si el remitente es el mismo número del negocio, es un eco.
                const isEcho = from === businessPhone;
                
                // Si es un eco, el destinatario real está en el objeto 'contacts' o en la metadata del mensaje
                let targetPhone = from;
                if (isEcho) {
                    // En los ecos, Meta suele enviar el contacto del destinatario en la misma respuesta
                    const contact = body.entry[0].changes[0].value.contacts?.[0];
                    if (contact && contact.wa_id) {
                        targetPhone = contact.wa_id;
                    }
                    console.log(`[ECHO] Mensaje enviado desde el celular hacia: ${targetPhone}`);
                }

                let content = '';
                let mediaUrl = undefined;
                let mediaType = undefined;

                if (type === 'text') {
                    content = message.text.body;
                } else if (type === 'image') {
                    content = message.image.caption || 'IMAGEN RECIBIDA';
                    mediaUrl = `/api/chat/media/${message.image.id}`;
                    mediaType = 'image';
                } else if (type === 'document') {
                    content = message.document.caption || message.document.filename || 'DOCUMENTO RECIBIDO';
                    mediaUrl = `/api/chat/media/${message.document.id}`;
                    mediaType = 'document';
                } else if (type === 'video') {
                    content = message.video.caption || 'VIDEO RECIBIDO';
                    mediaUrl = `/api/chat/media/${message.video.id}`;
                    mediaType = 'video';
                } else if (type === 'audio') {
                    content = 'NOTA DE VOZ / AUDIO RECIBIDO';
                    mediaUrl = `/api/chat/media/${message.audio.id}`;
                    mediaType = 'audio';
                } else if (type === 'sticker') {
                    content = 'STICKER RECIBIDO';
                    mediaUrl = `/api/chat/media/${message.sticker.id}`;
                    mediaType = 'image';
                } else {
                    content = `MENSAJE DE TIPO: ${type.toUpperCase()}`;
                }

                console.log(`${isEcho ? '[ECO] ' : ''}MENSAJE DE ${from}: ${content}`);

                // Procesar mensaje usando el RPC Seguro
                const phoneNumberId = metadata?.phone_number_id || null;

                const { error: rpcError } = await supabase.rpc('process_incoming_whatsapp', {
                    p_phone: targetPhone,
                    p_content: content.toUpperCase(),
                    p_phone_number_id: phoneNumberId,
                    p_media_url: mediaUrl,
                    p_media_type: mediaType,
                    p_is_echo: isEcho
                });

                if (rpcError) {
                    console.error('Error in RPC process_incoming_whatsapp:', rpcError);
                }

                // \ud83e\udd16 IA RESOLUTIVA (FASE 8)
                // Solo respondemos si NO es un eco (mensaje del cliente)
                if (!isEcho && content) {
                    // Ejecutamos en segundo plano para no bloquear el webhook (Meta requiere respuesta r\u00E1pida)
                    aiAssistantService.handleIncoming(from, content, phoneNumberId, message.id)
                        .catch(err => console.error('[AI_HOOK_ERROR]', err));
                }

                return new NextResponse('EVENT_RECEIVED', { status: 200 });
            } else if (body.entry[0].changes[0].value.statuses && body.entry[0].changes[0].value.statuses[0]) {
                // Manejar estados de mensajes (sent, delivered, read)
                const statusUpdate = body.entry[0].changes[0].value.statuses[0];
                const whatsappId = statusUpdate.id;
                const status = statusUpdate.status; // 'sent' | 'delivered' | 'read'

                console.log(`Actualización de estado de WhatsApp: ${whatsappId} -> ${status}`);

                // Actualizar estado usando RPC Seguro para evitar violaciones de RLS
                const { error: updateError } = await supabase.rpc('update_whatsapp_message_status', {
                    p_whatsapp_id: whatsappId,
                    p_status: status,
                    p_is_read: status === 'read'
                });

                if (updateError) {
                    console.error('Error in RPC update_whatsapp_message_status:', updateError);
                }

                return new NextResponse('EVENT_RECEIVED', { status: 200 });
            } else {
                return new NextResponse('EVENT_RECEIVED', { status: 200 });
            }
        } else {
            return new NextResponse('Not a WhatsApp event', { status: 404 });
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
