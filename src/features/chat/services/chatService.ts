import { createClient } from '@/lib/supabase/client';
import { ChatConversation, ChatMessage } from '../types/chat';

const supabase = createClient();

// Helper para simular sentimiento (neutral por defecto para nuevas msgs)
const mockAnalyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
    const positive = ['gracias', 'excelente', 'perfecto', 'bien', 'bueno', 'si', 'sí', 'ok', 'listo'];
    const negative = ['mal', 'error', 'no', 'peor', 'tarde', 'queja', 'reclamar'];

    const lowerText = text.toLowerCase();
    if (positive.some(word => lowerText.includes(word))) return 'positive';
    if (negative.some(word => lowerText.includes(word))) return 'negative';
    return 'neutral';
};

export const chatService = {
    /**
     * Obtiene todas las conversaciones de una sucursal o globales.
     */
    async getConversations(branchId?: string) {
        let query = supabase
            .from('chat_conversations')
            .select(`
                *,
                client:clients(full_name, phone, avatar_url),
                branch:branches(name)
            `)
            .order('last_message_at', { ascending: false });

        if (branchId) {
            query = query.eq('branch_id', branchId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(conv => ({
            ...conv,
            client_name: conv.client?.full_name || 'Desconocido',
            client_phone: conv.client?.phone || conv.customer_phone || '',
            client_avatar: conv.client?.avatar_url || '',
            branch_name: (conv as any).branch?.name || ''
        })) as (ChatConversation & { branch_name: string })[];
    },

    /**
     * Obtiene el historial de mensajes de una conversación.
     */
    async getMessages(conversationId: string) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ChatMessage[];
    },

    /**
     * Envía un mensaje desde el Agente (SastrePro) al Cliente por WhatsApp.
     */
    async sendMessage(conversationId: string, content: string, senderRole: 'agent' | 'bot' = 'agent', mediaUrl?: string, mediaType?: 'image' | 'document' | 'audio' | 'video') {
        // 1. Obtenemos el teléfono del cliente de la conversación para la API de forma más robusta
        const { data: conv, error: convError } = await supabase
            .from('chat_conversations')
            .select(`
                *,
                client:clients(phone, full_name)
            `)
            .eq('id', conversationId)
            .single();

        if (convError || !conv) {
            console.error('[CHAT_SERVICE] Error al obtener conversación:', convError);
            throw new Error('No se pudo encontrar la conversación o los datos del cliente');
        }

        // Intento de extracción de teléfono (Campo persistido > Join > Metadata)
        let phone = (conv as any).customer_phone || (conv as any).client?.phone;

        if (!phone) {
            phone = (conv as any).metadata?.phone;
        }

        if (!phone) {
            console.error('[CHAT_SERVICE] Fallo de envío: Teléfono ausente en conv', conversationId);
            throw new Error('No se pudo encontrar el teléfono del cliente. Verifique que el cliente tenga un número asignado.');
        }

        const response = await fetch('/api/chat/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId,
                content,
                phone,
                mediaUrl,
                mediaType
            })
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Error al enviar mensaje');

        return result.message;
    },

    async analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'critical'> {
        try {
            const response = await fetch('/api/ai/analyze-sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            return data.sentiment || 'neutral';
        } catch (e) {
            console.error(e);
            return 'neutral';
        }
    },

    /**
     * Simulación de mensaje entrante (para pruebas y demo).
     */
    async simulateClientMessage(conversationId: string) {
        const responses = [
            "Hola, ¿cómo va mi pedido?",
            "Gracias por la atención.",
            "Me gustaría agendar una cita para mañana.",
            "¿Tienen servicio de sastre para hoy?",
            "El traje me quedó excelente, muchas gracias."
        ];
        const randomMsg = responses[Math.floor(Math.random() * responses.length)];

        const { data: message, error } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversationId,
                sender_role: 'client',
                content: randomMsg,
                sentiment: mockAnalyzeSentiment(randomMsg),
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;

        // Actualizar conversación
        await supabase
            .from('chat_conversations')
            .update({
                last_message_content: randomMsg,
                last_message_at: new Date().toISOString(),
                unread_count: 1 // TODO: Implementar incremento real en SQL RPC
            })
            .eq('id', conversationId);

        return message;
    },

    /**
     * Busca o crea una conversación por teléfono.
     * Útil para cuando el usuario inicia un chat desde un número nuevo.
     */
    async findOrCreateConversationByPhone(phone: string, branchId: string, organizationId: string) {
        const cleanPhone = phone.replace(/\D/g, '');
        // Usar prefijo 52 (México) si no tiene y parece ser local de 10 dígitos
        const normalizedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
        const basePhone = cleanPhone.slice(-10);

        // 1. Buscar Cliente (Priorizando Sucursal, pero buscando en toda la Organización)
        let { data: clients, error: searchError } = await supabase
            .from('clients')
            .select('id, full_name, phone, organization_id, last_branch_id')
            .eq('organization_id', organizationId)
            .ilike('phone', `%${basePhone}%`)
            .order('last_branch_id', { ascending: false }); // Esto pondrá los que coinciden con branchId arriba si ordenamos inteligentemente...
            // Pero mejor lo refinamos programáticamente para ser seguros:
        
        let client = clients?.find(c => c.last_branch_id === branchId) || clients?.[0];

        if (!client) {
            const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({
                    full_name: `PROSPECTO ${cleanPhone.slice(-4)}`,
                    phone: normalizedPhone,
                    organization_id: organizationId,
                    last_branch_id: branchId
                })
                .select()
                .single();

            if (clientError) throw clientError;
            client = newClient;
        }

        if (!client) throw new Error('Error al gestionar el cliente');

        // 2. Buscar o Crear Conversación
        let { data: conversation } = await supabase
            .from('chat_conversations')
            .select(`
                *,
                client:clients(full_name, phone, avatar_url)
            `)
            .eq('client_id', client.id)
            .eq('branch_id', branchId)
            .eq('status', 'active')
            .maybeSingle();

        if (!conversation) {
            const { data: newConv, error: convError } = await supabase
                .from('chat_conversations')
                .insert({
                    client_id: client.id,
                    branch_id: branchId,
                    organization_id: organizationId,
                    status: 'active',
                    channel: 'whatsapp',
                    last_message_content: 'Conversación iniciada por agente',
                    sentiment_score: 'neutral',
                    last_message_at: new Date().toISOString()
                })
                .select(`
                    *,
                    client:clients(full_name, phone, avatar_url)
                `)
                .single();

            if (convError) throw convError;
            conversation = newConv;
        }

        return {
            ...conversation,
            client_name: conversation.client?.full_name || 'Desconocido',
            client_phone: conversation.client?.phone || conversation.customer_phone || '',
            client_avatar: conversation.client?.avatar_url || ''
        } as ChatConversation;
    },

    async uploadFile(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `chat-media/${fileName}`;

        const { data, error } = await supabase.storage
            .from('chat-media')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('chat-media')
            .getPublicUrl(filePath);

        return {
            publicUrl,
            fileType: file.type.startsWith('image') ? 'image' : 'document'
        };
    },

    async markAsRead(conversationId: string) {
        const { error } = await supabase
            .from('chat_conversations')
            .update({ unread_count: 0 })
            .eq('id', conversationId);

        if (error) throw error;
    },

    async updateClientName(clientId: string, newName: string) {
        const { data, error } = await supabase
            .from('clients')
            .update({ full_name: newName.toUpperCase() })
            .eq('id', clientId)
            .select('id');

        if (error) throw error;

        if (!data || data.length === 0) {
            throw new Error('No se pudo actualizar el nombre. Es posible que no tenga permisos sobre este cliente o que pertenezca a otra organización.');
        }
    },

    async clearChat(conversationId: string) {
        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .eq('conversation_id', conversationId);

        if (error) throw error;
    }
};
