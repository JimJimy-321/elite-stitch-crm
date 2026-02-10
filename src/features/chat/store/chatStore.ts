import { create } from 'zustand';
import { ChatConversation, ChatMessage, Sentiment } from '../types/chat';

interface ChatStore {
    activeConversationId: string | null;
    conversations: ChatConversation[];
    messages: Record<string, ChatMessage[]>; // Key: conversationId
    isLoading: boolean;

    // Actions
    setActiveConversation: (id: string | null) => void;
    setConversations: (chats: ChatConversation[]) => void;
    addMessage: (msg: ChatMessage) => void;
    updateConversationStatus: (id: string, status: string) => void;

    // AI Mock Actions
    simulateIncomingMessage: (branchId: string) => void; // Para demo
}

export const useChatStore = create<ChatStore>((set, get) => ({
    activeConversationId: null,
    conversations: [],
    messages: {},
    isLoading: false,

    setActiveConversation: (id) => set({ activeConversationId: id }),

    setConversations: (conversations) => set({ conversations }),

    addMessage: (msg) => set((state) => {
        const currentMsgs = state.messages[msg.conversation_id] || [];
        // Actualizar último mensaje en la conversación
        const updatedConversations = state.conversations.map(c =>
            c.id === msg.conversation_id
                ? { ...c, last_message_content: msg.content, last_message_at: msg.created_at, sentiment_score: msg.sentiment || c.sentiment_score }
                : c
        );

        // Reordenar conversaciones (la más reciente arriba)
        updatedConversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

        return {
            messages: {
                ...state.messages,
                [msg.conversation_id]: [...currentMsgs, msg]
            },
            conversations: updatedConversations
        };
    }),

    updateConversationStatus: (id, status) => set((state) => ({
        conversations: state.conversations.map(c =>
            c.id === id ? { ...c, status: status as any } : c
        )
    })),

    simulateIncomingMessage: (branchId) => {
        console.log("Simulando mensaje para branch:", branchId);
        // Implementación real será en el componente UI o Service para efectos
    }
}));
