import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/features/chat/services/whatsappService';
// Note: We don't actually need the supabase client here yet, but let's fix the import anyway for future use
import { supabaseWebhookClient } from '@/lib/supabase/webhook';

export async function POST(request: NextRequest) {
    try {
        const { conversationId, content, phone } = await request.json();

        if (!content || !phone) {
            return NextResponse.json({ success: false, error: 'Content and phone are required' }, { status: 400 });
        }

        console.log(`Intentando enviar mensaje WhatsApp:
            Para: ${phone}
            Contenido: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}
            Conv ID: ${conversationId}`);

        // 1. Send via WhatsApp Cloud API
        const result = await whatsappService.sendTextMessage(phone, content);

        if (!result.success) {
            console.error('WhatsApp API Error:', result.error);
            return NextResponse.json({ success: false, error: 'Error sending message via WhatsApp' }, { status: 500 });
        }

        // 2. Return success with data (including Meta message ID)
        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
