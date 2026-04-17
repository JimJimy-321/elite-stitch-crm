import { create } from 'zustand';
import { ChatConversation, ChatMessage, Sentiment } from '../types/chat';

interface ChatStore {
    activeConversationId: string | null;
    conversations: ChatConversation[];
    messages: Record<string, ChatMessage[]>; // Key: conversationId
    isLoading: boolean;

    // Actions
    setActiveConversation: (id: string | null) => void;
    setConversations: (chats: ChatConversation[] | ((prev: ChatConversation[]) => ChatConversation[])) => void;
    addMessage: (msg: ChatMessage) => void;
    updateConversationStatus: (id: string, status: string) => void;
    markAsRead: (id: string) => void;
    createConversation: (conversation: ChatConversation) => void;

    // AI Mock Actions
    simulateIncomingMessage: (branchId: string) => void; // Para demo
}

export const useChatStore = create<ChatStore>((set, get) => ({
    activeConversationId: null,
    conversations: [],
    messages: {},
    isLoading: false,

    setActiveConversation: (id) => set({ activeConversationId: id }),

    setConversations: (conversations) => set((state) => ({
        conversations: typeof conversations === 'function' ? conversations(state.conversations) : conversations
    })),

    addMessage: (msg) => set((state) => {
        const currentMsgs = state.messages[msg.conversation_id] || [];
        
        // 1. Identificar si existe coincidencia
        let existingIdx = currentMsgs.findIndex(m => m.id === msg.id);
        
        // Si no se encuentra por ID, buscar reconciliación optimista
        if (existingIdx === -1 && msg.sender_role === 'agent') {
            existingIdx = currentMsgs.findIndex(m => {
                const sameContent = m.content === msg.content;
                const isPlaceholder = m.content?.startsWith('Cargando ');
                const sameMedia = m.media_type && m.media_type === msg.media_type;
                
                return (sameContent || (isPlaceholder && sameMedia)) && 
                       m.status === 'sending' &&
                       Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 60000;
            });
        }

        
        let newMsgs: ChatMessage[];
        if (existingIdx !== -1) {
            // Reconciliación o actualización: preservamos el ID del mensaje real si viene del servidor
            newMsgs = [...currentMsgs];
            newMsgs[existingIdx] = { ...newMsgs[existingIdx], ...msg };
        } else {
            // Nuevo mensaje legítimo
            newMsgs = [...currentMsgs, msg];
        }


        // 2. Actualizar último mensaje en la conversación
        const updatedConversations = state.conversations.map(c =>
            c.id === msg.conversation_id
                ? { 
                    ...c, 
                    last_message_content: msg.content, 
                    last_message_at: msg.created_at, 
                    sentiment_score: msg.sentiment || c.sentiment_score 
                }
                : c
        );

        // 3. Reordenar conversaciones (la más reciente arriba)
        updatedConversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

        return {
            messages: {
                ...state.messages,
                [msg.conversation_id]: newMsgs
            },
            conversations: updatedConversations
        };
    }),


    markAsRead: async (id) => {
        // optimista: cerramos contador localmente
        set((state) => ({
            conversations: state.conversations.map(c =>
                c.id === id ? { ...c, unread_count: 0 } : c
            )
        }));

        try {
            await fetch('/api/chat/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: id })
            });
        } catch (error) {
            console.error('[CHAT_STORE] Error marking as read:', error);
        }
    },

    updateConversationStatus: (id, status) => set((state) => ({
        conversations: state.conversations.map(c =>
            c.id === id ? { ...c, status: status as any } : c
        )
    })),

    createConversation: (conversation: ChatConversation) => set((state) => {
        // Evitar duplicados
        if (state.conversations.some(c => c.id === conversation.id)) return state;

        return {
            conversations: [conversation, ...state.conversations]
        };
    }),

    simulateIncomingMessage: (branchId) => {
        console.log("Simulando mensaje para branch:", branchId);
        // Implementación real será en el componente UI o Service para efectos
    }
}));
