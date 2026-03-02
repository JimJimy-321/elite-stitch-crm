import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/features/chat/services/whatsappService';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone') || '524421205583'; // Default user phone
    const template = searchParams.get('template') || 'hello_world';

    console.log(`Ejecutando prueba de WhatsApp para: ${phone} con plantilla: ${template}`);

    const result = await whatsappService.sendTemplateMessage(phone, template);

    return NextResponse.json({
        success: result.success,
        message: result.success ? 'Prueba enviada correctamente' : 'Error al enviar prueba',
        debug: result.data,
        config: {
            phone_id: process.env.WHATSAPP_PHONE_NUMBER_ID,
            has_token: !!process.env.WHATSAPP_ACCESS_TOKEN,
            token_snippet: process.env.WHATSAPP_ACCESS_TOKEN ? process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 10) + '...' : 'none'
        }
    });
}
