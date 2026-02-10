import { createClient } from '@/lib/supabase/client';
import { ChatConversation, ChatMessage, Sentiment } from '../types/chat';

const supabase = createClient();

// Mock Brain para Análisis de Sentimiento
function mockAnalyzeSentiment(text: string): Sentiment {
    const criticalKeywords = ['tarda', 'mal', 'error', 'problema', 'retraso', 'no sirve', 'feo', 'roto', 'urge'];
    const positiveKeywords = ['gracias', 'excelente', 'bien', 'bueno', 'rápido', 'perfecto', 'amable'];

    const lower = text.toLowerCase();

    if (criticalKeywords.some(k => lower.includes(k))) return 'critical';
    if (positiveKeywords.some(k => lower.includes(k))) return 'positive';
    return 'neutral';
}

export const chatService = {
    async getConversations(branchId?: string) {
        let query = supabase
            .from('chat_conversations')
            .select(`
                *,
                client:clients(full_name, phone)
            `)
            .order('last_message_at', { ascending: false });

        if (branchId) {
            query = query.eq('branch_id', branchId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((c: any) => ({
            ...c,
            client_name: c.client?.full_name || 'Desconocido',
            client_phone: c.client?.phone || ''
        }));
    },

    async getMessages(conversationId: string) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async sendMessage(conversationId: string, content: string, senderRole: 'agent' | 'bot' = 'agent') {
        const sentiment = mockAnalyzeSentiment(content);

        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversationId,
                sender_role: senderRole,
                content: content,
                sentiment: sentiment,
                is_read: true
            })
            .select()
            .single();

        if (error) throw error;

        // Actualizar conversación
        await supabase
            .from('chat_conversations')
            .update({
                last_message_content: content,
                last_message_at: new Date().toISOString(),
                // Si es agente, reseteamos unread
                unread_count: 0
            })
            .eq('id', conversationId);

        return data;
    },

    // Función "Mágica" para Simular Cliente (Demo)
    async simulateClientMessage(conversationId: string) {
        const messages = [
            "¿Cuándo estará listo mi traje?",
            "Necesito que ajusten el largo un poco más.",
            "¡Muchas gracias! Quedó perfecto.",
            "Hola, ¿abren los domingos?",
            "Llevo esperando 3 semanas, esto es inaceptable.",
            "¿Puedo pagar con tarjeta?",
            "El botón se cayó otra vez, qué mal servicio.",
        ];

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        // Obtenemos el cliente de la conversación para simular el "número"
        const { data: conversation } = await supabase
            .from('chat_conversations')
            .select('client:clients(phone)')
            .eq('id', conversationId)
            .single();

        let phone = '5550000000';

        // Fix: Handle potential array or object return from Supabase relation
        if (conversation?.client) {
            if (Array.isArray(conversation.client)) {
                if (conversation.client.length > 0) phone = conversation.client[0].phone || phone;
            } else if (typeof conversation.client === 'object') {
                phone = (conversation.client as any).phone || phone;
            }
        }

        // Usamos la misma lógica que el Webhook REAL
        return await this.handleIncomingMessage(phone, randomMsg);
    },

    async createConversation(clientId: string, branchId: string) {
        const { data, error } = await supabase
            .from('chat_conversations')
            .insert({
                client_id: clientId,
                branch_id: branchId,
                status: 'active',
                last_message_content: 'Conversación iniciada',
                sentiment_score: 'neutral'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async handleIncomingMessage(phone: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'document' | 'audio' | 'video') {
        // 1. Normalizar teléfono (eliminar + o espacios si es necesario)
        const cleanPhone = phone.replace(/\D/g, '');

        // 2. Buscar cliente
        let { data: client } = await supabase
            .from('clients')
            .select('id, full_name, organization_id, last_branch_id')
            .or(`phone.eq.${cleanPhone},phone.eq.+${cleanPhone}`)
            .maybeSingle();

        // Si no existe, crear prospecto
        if (!client) {
            // Intentar obtener contexto de organización del usuario actual (Simulación)
            let orgId = null;
            let branchId = null;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id, assigned_branch_id')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    orgId = profile.organization_id;
                    branchId = profile.assigned_branch_id;
                }
            }

            // TODO: Para Webhook real, necesitaríamos determinar la org basado en el número de destino (phone_number_id)

            const { data: newClient, error: createError } = await supabase
                .from('clients')
                .insert({
                    full_name: `Prospecto WhatsApp ${cleanPhone.slice(-4)}`,
                    phone: cleanPhone,
                    organization_id: orgId, // CRÍTICO: Necesario para RLS
                    last_branch_id: branchId
                })
                .select()
                .single();

            if (createError) {
                console.error("Error creating client from WhatsApp:", createError);
                throw createError;
            }
            client = newClient;
        }

        if (!client) throw new Error("Could not find or create client");

        // 3. Buscar o Crear Conversación Activa
        let { data: conversation } = await supabase
            .from('chat_conversations')
            .select('id')
            .eq('client_id', client.id)
            .eq('status', 'active')
            .maybeSingle();

        if (!conversation) {
            const { data: newConv, error: convError } = await supabase
                .from('chat_conversations')
                .insert({
                    client_id: client.id,
                    branch_id: client.last_branch_id, // Asignar a su última sucursal conocida
                    status: 'active',
                    channel: 'whatsapp',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (convError) throw convError;
            conversation = newConv;
        }

        if (!conversation) throw new Error("Could not find or create conversation");

        // 4. Analizar Sentimiento
        const sentiment = mockAnalyzeSentiment(content);

        // 5. Guardar Mensaje
        const { data: message, error: msgError } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversation.id,
                sender_role: 'client',
                content: content,
                sentiment: sentiment,
                media_url: mediaUrl,
                media_type: mediaType,
                is_read: false
            })
            .select()
            .single();

        if (msgError) throw msgError;

        // 6. Actualizar Conversación (Last Message & Unread)
        // Usamos RPC para atomic increment si fuera necesario, o update simple por ahora
        await supabase
            .from('chat_conversations')
            .update({
                last_message_content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                last_message_at: new Date().toISOString(),
                sentiment_score: sentiment, // Actualizar sentimiento general
                unread_count: 1 // Reset simple a 1 o incrementar (idealmente RPC)
            })
            .eq('id', conversation.id);

        return message;
    }
};
