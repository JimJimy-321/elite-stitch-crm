'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { ChatListItem } from '@/features/chat/components/ChatListItem';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { chatService } from '@/features/chat/services/chatService';
import { useChatStore } from '@/features/chat/store/chatStore';
import { createClient } from '@/lib/supabase/client';
import { Send, Paperclip, MoreVertical, Search, Bot, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { SentimentBadge } from '@/features/chat/components/SentimentBadge';

export default function ChatPage() {
    const [inputText, setInputText] = useState('');
    const {
        conversations,
        activeConversationId,
        messages,
        setConversations,
        setActiveConversation,
        addMessage
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
            } catch (error) {
                console.error("Error loading messages", error);
            }
        };
        loadMessages();
    }, [activeConversationId]);

    // Auto-scroll al fondo
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeConversationId]);

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

            // Re-fetch para tener ID real y sync (opcional si usamos realtime subscription)
        } catch (error) {
            toast.error("Error al enviar mensaje");
        }
    };

    const handleSimulateIncoming = async () => {
        if (!activeConversationId) return;
        toast.info("Simulando respuesta del cliente...");
        try {
            const msg = await chatService.simulateClientMessage(activeConversationId);
            addMessage(msg);
            toast.success("Mensaje recibido!");
        } catch (error) {
            console.error(error);
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
                        placeholder="Buscar o iniciar un nuevo chat"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
                {conversations.map(chat => (
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
                    <button
                        onClick={handleSimulateIncoming}
                        className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-colors"
                        title="Debug: Simular mensaje entrante"
                    >
                        <Bot className="w-3 h-3" /> Simular Cliente
                    </button>
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

            <button
                onClick={async () => {
                    toast.info("Simulando mensaje entrante...");
                    try {
                        const randomPhone = `52${Math.floor(Math.random() * 10000000000)}`;
                        await chatService.handleIncomingMessage(randomPhone, "Hola quierio saber el estatus de mi prenda", undefined, undefined);
                        const chats = await chatService.getConversations();
                        setConversations(chats);
                        toast.success("Mensaje simulado recibido");
                    } catch (e) {
                        console.error(e);
                        toast.error("Error simulando mensaje");
                    }
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
            >
                <Bot className="w-5 h-5" />
                Simular Mensaje de Prueba
            </button>
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
                    <button className="w-full py-2 px-3 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 text-left">
                        Ver Perfil CRM
                    </button>
                    <button className="w-full py-2 px-3 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 text-left">
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
