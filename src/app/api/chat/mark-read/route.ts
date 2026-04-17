import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/features/chat/services/whatsappService';
import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';

export async function POST(request: NextRequest) {
    try {
        const { conversationId } = await request.json();

        if (!conversationId) {
            return NextResponse.json({ success: false, error: 'conversationId is required' }, { status: 400 });
        }

        // 1. Obtener el contexto del chat (sucursal, credenciales)
        const { data: contextData, error: contextError } = await supabase
            .rpc('get_chat_context', { p_conversation_id: conversationId })
            .single();

        if (contextError || !contextData) {
            return NextResponse.json({ 
                success: false, 
                error: 'Contexto no encontrado para la conversación' 
            }, { status: 404 });
        }

        const context = contextData as any;

        // 2. Verificar configuración de lectura en la sucursal (metadata)
        const { data: branch, error: branchError } = await supabase
            .from('branches')
            .select('metadata')
            .eq('id', context.branch_id)
            .single();

        const sendReadReceipts = branch?.metadata?.send_read_receipts !== false; // Default true

        // 3. Obtener el último mensaje no leído del cliente
        const { data: lastMessage, error: msgsError } = await supabase
            .from('chat_messages')
            .select('id, metadata')
            .eq('conversation_id', conversationId)
            .eq('sender_role', 'client')
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (msgsError) {
            console.error('[MARK_READ] Error recuperando mensajes:', msgsError);
        }

        // 4. Si hay mensaje y las lecturas están activas, avisar a Meta
        if (lastMessage?.metadata?.whatsapp_message_id && sendReadReceipts) {
            const token = context.wa_access_token || process.env.WHATSAPP_ACCESS_TOKEN;
            const waConfig = { phoneNumberId: context.wa_phone_number_id, accessToken: token };
            
            console.log(`[MARK_READ] Notificando lectura a Meta para msg: ${lastMessage.metadata.whatsapp_message_id}`);
            await whatsappService.markMessageAsRead(lastMessage.metadata.whatsapp_message_id, waConfig);
        }

        // 5. Siempre marcar como leído en nuestra DB y resetear contador
        const { error: updateError } = await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('sender_role', 'client')
            .eq('is_read', false);

        const { error: convError } = await supabase
            .from('chat_conversations')
            .update({ unread_count: 0 })
            .eq('id', conversationId);

        if (updateError || convError) {
            console.error('[MARK_READ] Error actualizando DB:', { updateError, convError });
        }

        return NextResponse.json({ success: true, notifiedMeta: sendReadReceipts });
    } catch (error) {
        console.error('[MARK_READ] Internal Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
