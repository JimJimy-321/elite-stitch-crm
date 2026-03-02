import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/features/chat/services/chatService';
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

        // Verificar que es un evento de WhatsApp
        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const message = body.entry[0].changes[0].value.messages[0];
                const from = message.from; // Número de teléfono (e.g., 5215512345678)
                const type = message.type;

                let content = '';
                let mediaUrl = undefined;
                let mediaType = undefined;

                if (type === 'text') {
                    content = message.text.body;
                } else if (type === 'image') {
                    content = message.image.caption || 'Imagen recibida';
                    mediaUrl = `/api/chat/media/${message.image.id}`;
                    mediaType = 'image';
                } else if (type === 'sticker') {
                    content = 'Sticker recibido';
                    mediaUrl = `/api/chat/media/${message.sticker.id}`;
                    mediaType = 'image'; // Stickers can be treated as images
                } else {
                    content = `Mensaje de tipo ${type} recibido`;
                }

                console.log(`Mensaje recibido de ${from}: ${content}`);

                // Procesar mensaje usando el RPC Seguro para saltar RLS
                const phoneNumberId = body.entry[0].changes[0].value.metadata?.phone_number_id || null;

                const { error: rpcError } = await supabase.rpc('process_incoming_whatsapp', {
                    p_phone: from,
                    p_content: content,
                    p_phone_number_id: phoneNumberId,
                    p_media_url: mediaUrl,
                    p_media_type: mediaType
                });

                if (rpcError) {
                    console.error('Error in RPC process_incoming_whatsapp:', rpcError);
                }

                return new NextResponse('EVENT_RECEIVED', { status: 200 });
            } else if (body.entry[0].changes[0].value.statuses && body.entry[0].changes[0].value.statuses[0]) {
                // Manejar estados de mensajes (sent, delivered, read)
                const statusUpdate = body.entry[0].changes[0].value.statuses[0];
                const whatsappId = statusUpdate.id;
                const status = statusUpdate.status; // 'sent' | 'delivered' | 'read'

                console.log(`Actualización de estado de WhatsApp: ${whatsappId} -> ${status}`);

                // Buscar mensaje por whatsapp_message_id en metadata
                const { data: messages } = await supabase
                    .from('chat_messages')
                    .select('id, metadata')
                    .contains('metadata', { whatsapp_message_id: whatsappId });

                if (messages && messages.length > 0) {
                    const message = messages[0];
                    await supabase
                        .from('chat_messages')
                        .update({
                            status: status, // Mapping exact status from Meta
                            is_read: status === 'read'
                        })
                        .eq('id', message.id);
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
