import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/features/chat/services/chatService';

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
                    // NOTA: Para obtener la URL real se requiere llamar a la API de Media de WhatsApp
                    // Por ahora guardamos el ID para referencia futura o una URL placeholder
                    mediaUrl = `https://graph.facebook.com/v18.0/${message.image.id}`;
                    mediaType = 'image';
                } else {
                    content = `Mensaje de tipo ${type} recibido`;
                }

                console.log(`Mensaje recibido de ${from}: ${content}`);

                // Procesar mensaje usando el Service
                await chatService.handleIncomingMessage(from, content, mediaUrl, mediaType as any);

                return new NextResponse('EVENT_RECEIVED', { status: 200 });
            } else {
                // Puede ser un estado de mensaje (sent, delivered, read) - por ahora los ignoramos o loggeamos
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
