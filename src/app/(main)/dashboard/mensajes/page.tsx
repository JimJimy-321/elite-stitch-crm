'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { ChatListItem } from '@/features/chat/components/ChatListItem';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { ChatConversation, ChatMessage } from '@/features/chat/types/chat';
import { chatService } from '@/features/chat/services/chatService';
import { useChatStore } from '@/features/chat/store/chatStore';
import { createClient } from '@/lib/supabase/client';
import { Send, Paperclip, MoreVertical, Search, MessageSquare, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { SentimentBadge } from '@/features/chat/components/SentimentBadge';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const {
        conversations,
        activeConversationId,
        messages,
        setConversations,
        setActiveConversation,
        addMessage,
        markAsRead: markAsReadInStore
    } = useChatStore();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Cargar conversaciones iniciales
    useEffect(() => {
        const loadChats = async () => {
            try {
                // TODO: Obtener branch_id del usuario real. Por ahora hardcoded demo o fetch.
                const { data: { user } } = await supabase.auth.getUser();
                // Simulación: traer todas por ahora para el Dueño
                const chats = await chatService.getConversations();
                setConversations(chats);
            } catch (error) {
                console.error("Error loading chats", error);
            }
        };
        loadChats();
    }, [setConversations]);

    // Cargar mensajes cuando cambia el chat activo
    useEffect(() => {
        if (!activeConversationId) return;

        const loadMessages = async () => {
            try {
                const msgs = await chatService.getMessages(activeConversationId);
                // Actualizar store (simplificado por ahora, idealmente usar action setMessages)
                // Aquí forzamos un update local si no existe
                useChatStore.setState(state => ({
                    messages: { ...state.messages, [activeConversationId]: msgs }
                }));

                // Marcar como leído
                if (activeConversationId) {
                    await chatService.markAsRead(activeConversationId);
                    markAsReadInStore(activeConversationId);
                }
            } catch (error) {
                console.error("Error loading messages", error);
            }
        };
        loadMessages();
    }, [activeConversationId, setConversations, conversations]);

    // Auto-scroll al fondo
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeConversationId]);

    // --- REALTIME SUBSCRIPTION ---
    useEffect(() => {
        const channel = supabase
            .channel('chat_realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages'
            }, async (payload) => {
                const newMsg = payload.new as any;
                addMessage(newMsg);
                // Notificar si es un mensaje del cliente en el chat activo
                if (newMsg.conversation_id === activeConversationId && newMsg.sender_role === 'client') {
                    // El scroll se activa por el useEffect de messages
                    // Marcar como leído automáticamente si el chat está abierto
                    try {
                        if (activeConversationId) {
                            markAsReadInStore(activeConversationId);
                        }
                    } catch (e) {
                        console.error("Error auto-marking as read", e);
                    }
                } else if (newMsg.sender_role === 'client') {
                    toast.info("Nuevo mensaje recibido");
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_conversations'
            }, (payload: any) => {
                const updatedConv = payload.new;
                // Actualizar lista de conversaciones
                setConversations((prev: ChatConversation[]) => prev.map((c: ChatConversation) =>
                    c.id === updatedConv.id ? { ...c, ...updatedConv } : c
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConversationId, addMessage, conversations, setConversations]);

    // Filtrar conversaciones por nombre o teléfono
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter(c =>
            c.client_name.toLowerCase().includes(q) ||
            c.client_phone.includes(q)
        );
    }, [conversations, searchQuery]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !activeConversationId) return;

        try {
            const tempId = crypto.randomUUID();
            const optimisticMsg = {
                id: tempId,
                conversation_id: activeConversationId,
                sender_role: 'agent',
                content: inputText,
                sentiment: 'neutral',
                is_read: false,
                created_at: new Date().toISOString()
            } as any;

            // Optimistic update
            addMessage(optimisticMsg);
            setInputText('');

            // Server send
            await chatService.sendMessage(activeConversationId, optimisticMsg.content);

        } catch (error) {
            toast.error("Error al enviar mensaje");
        }
    };

    const activeChat = conversations.find(c => c.id === activeConversationId);
    const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

    // --- RENDER ---

    const SidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header Sidebar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src="/avatar-placeholder.png" className="w-10 h-10 rounded-full bg-gray-300" alt="Me" />
                    <h2 className="font-bold text-gray-700">Chats</h2>
                </div>
                <div className="flex gap-2 text-gray-500">
                    <MoreVertical className="w-5 h-5 cursor-pointer" />
                </div>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-gray-100">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(chat => (
                    <ChatListItem
                        key={chat.id}
                        conversation={chat}
                        isActive={chat.id === activeConversationId}
                        onClick={() => setActiveConversation(chat.id)}
                    />
                ))}
            </div>
        </div>
    );

    const ChatWindowContent = activeConversationId ? (
        <>
            {/* Chat Header */}
            <div className="h-16 px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        {activeChat?.client_name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{activeChat?.client_name}</h3>
                        <p className="text-xs text-gray-500">
                            {activeChat?.client_phone} • {activeChat?.status}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Search className="w-5 h-5 text-gray-500 cursor-pointer" />
                    <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {currentMessages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button type="button" className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Escribe un mensaje"
                        className="flex-1 py-2 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </>
    ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center h-full">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Centro de Mensajería SastrePro</h2>
            <p className="max-w-md mb-8">Selecciona una conversación para ver el historial y responder a tus clientes. Conexión en tiempo real activa.</p>
        </div>
    );

    const InfoPanelContent = activeChat ? (
        <div className="p-6">
            <div className="mb-6 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl text-gray-500">
                    {activeChat.client_name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{activeChat.client_name}</h3>
                <p className="text-gray-500">{activeChat.client_phone}</p>
            </div>

            <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sentimiento Actual</h4>
                <div className="flex items-center gap-2">
                    <SentimentBadge sentiment={activeChat.sentiment_score} showLabel />
                </div>
            </div>

            <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Acciones Rápidas</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => router.push(`/dashboard/clients?search=${activeChat.client_phone}`)}
                        className="w-full py-2 px-3 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 text-purple-500" />
                        Ver Perfil CRM
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard/notas?new=true&phone=${activeChat.client_phone}`)}
                        className="w-full py-2 px-3 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <FileText className="w-4 h-4 text-purple-500" />
                        Crear Nueva Nota
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <ChatLayout
            sidebar={SidebarContent}
            chatWindow={ChatWindowContent}
            infoPanel={activeConversationId ? InfoPanelContent : undefined}
        />
    );
}
