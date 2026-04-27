import { NextResponse } from 'next/server';
import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { aiAssistantService } from '@/features/chat/services/aiAssistantService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/archive
 * Este endpoint procesa el archivado automático de chats inactivos.
 * Se recomienda llamarlo vía Cron Job una vez al día.
 */
export async function GET(req: Request) {
    try {
        // 1. Obtener candidatos a archivado (inactivos > 30 días y sin tickets abiertos)
        const { data: candidates, error: cError } = await supabase.rpc('get_inactive_chats_to_archive', {
            days_limit: 30
        });

        if (cError) throw cError;

        if (!candidates || candidates.length === 0) {
            return NextResponse.json({ message: 'No hay chats para archivar hoy.', archived_count: 0 });
        }

        console.log(`[ARCHIVE_CRON] Procesando ${candidates.length} chats...`);

        const results = [];

        for (const item of candidates) {
            const conversationId = item.conversation_id;

            // 2. Generar resumen con IA
            const summary = await aiAssistantService.summarizeConversation(conversationId);

            // 3. Actualizar conversación a 'archived' y guardar resumen
            const { error: uError } = await supabase
                .from('chat_conversations')
                .update({
                    status: 'archived',
                    ai_summary: summary || 'Sin resumen disponible.',
                    updated_at: new Date().toISOString()
                })
                .eq('id', conversationId);

            if (!uError) {
                results.push({ id: conversationId, status: 'success' });
            } else {
                results.push({ id: conversationId, status: 'error', error: uError.message });
            }
        }

        return NextResponse.json({
            message: 'Proceso de archivado completado.',
            processed: candidates.length,
            results
        });

    } catch (error: any) {
        console.error('[ARCHIVE_CRON_ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
