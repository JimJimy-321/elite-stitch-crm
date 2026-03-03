'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { ChatListItem } from '@/features/chat/components/ChatListItem';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { ChatConversation, ChatMessage } from '@/features/chat/types/chat';
import { chatService } from '@/features/chat/services/chatService';
import { useChatStore } from '@/features/chat/store/chatStore';
import { createClient } from '@/lib/supabase/client';
import { Send, Paperclip, MoreVertical, Search, MessageSquare, ExternalLink, FileText, Smile, User, Phone, Calendar, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { SentimentBadge } from '@/features/chat/components/SentimentBadge';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { hasProfanity, getOffensiveWords } from '@/shared/lib/profanity-filter';

export default function ChatPage() {
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [showLocalSearch, setShowLocalSearch] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const commonEmojis = ['😊', '😂', '👍', '🙏', '❤️', '👏', '🔥', '📍', '✅', '🆗'];

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

    // Auto-scroll al fondo SOLO si el usuario está cerca del fondo O cambia de chat
    useEffect(() => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;

        // Si es cambio de chat (length ya cambió o id cambió), forzamos al fondo
        if (isNearBottom || messages[activeConversationId!]?.length === 1) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeConversationId]);

    // Forzar scroll al fondo al seleccionar un chat nuevo
    useEffect(() => {
        if (activeConversationId) {
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeConversationId]);

    // --- REALTIME SUBSCRIPTION ---
    const activeIdRef = useRef(activeConversationId);
    useEffect(() => { activeIdRef.current = activeConversationId; }, [activeConversationId]);

    useEffect(() => {
        const channel = supabase
            .channel('chat_realtime_v2')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages'
            }, async (payload) => {
                const newMsg = payload.new as any;
                addMessage(newMsg);

                // Usar ref para evitar ciclos de dependencia pero tener el ID actual
                const currentActiveId = activeIdRef.current;

                if (newMsg.conversation_id === currentActiveId && newMsg.sender_role === 'client') {
                    try {
                        if (currentActiveId) {
                            markAsReadInStore(currentActiveId);
                            // El auto-scroll se dispara por el cambio en 'messages' en el otro effect
                        }
                    } catch (e) {
                        console.error("Error auto-marking as read", e);
                    }
                } else if (newMsg.sender_role === 'client') {
                    toast.info(`Nuevo mensaje de ${newMsg.sender_role === 'client' ? 'cliente' : ''}`, {
                        icon: '💬',
                        position: 'bottom-right'
                    });
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_conversations'
            }, (payload: any) => {
                const updatedConv = payload.new;
                setConversations((prev) => prev.map((c) =>
                    c.id === updatedConv.id ? { ...c, ...updatedConv } : c
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [addMessage, setConversations]); // Removido activeConversationId y conversations para evitar re-suscripciones constantes

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

        // Filtro de groserías (Filtro de seguridad avanzado)
        if (hasProfanity(inputText)) {
            const forbidden = getOffensiveWords(inputText);
            toast.error(`Mensaje bloqueado: SastrePro no permite lenguaje ofensivo (${forbidden.join(', ')})`, {
                position: 'top-center',
                duration: 5000,
            });
            return;
        }

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
            console.error('Error al enviar:', error);
            toast.error("Error al enviar mensaje");
        }
    };

    const handleClearChat = async () => {
        if (!activeConversationId) return;

        if (!window.confirm('¿Estás seguro de que deseas vaciar este chat? Esta acción no se puede deshacer y borrará el historial de mensajes.')) {
            return;
        }

        try {
            await chatService.clearChat(activeConversationId);
            // Limpiar historial localmente
            useChatStore.setState(state => ({
                messages: { ...state.messages, [activeConversationId]: [] }
            }));
            toast.success('Historial del chat vaciado correctamente');
            setShowHeaderMenu(false);
        } catch (error) {
            console.error('Error clearing chat:', error);
            toast.error('Error al vaciar el chat');
        }
    };

    const handleViewProfile = () => {
        if (!activeChat) return;
        setShowHeaderMenu(false);
        router.push(`/dashboard/clientes?search=${encodeURIComponent(activeChat.client_name)}`);
    };

    const handleScheduleAppointment = () => {
        setShowHeaderMenu(false);
        toast.info('La integración de citas con el calendario estará disponible pronto.');
    };

    const activeChat = conversations.find(c => c.id === activeConversationId);

    // Filtrar mensajes locales si hay búsqueda activa
    const currentMessages = useMemo(() => {
        const rawMessages = activeConversationId ? messages[activeConversationId] || [] : [];
        if (!localSearchQuery.trim()) return rawMessages;

        return rawMessages.filter(m =>
            m.content.toLowerCase().includes(localSearchQuery.toLowerCase())
        );
    }, [messages, activeConversationId, localSearchQuery]);

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
        <div className="flex flex-col h-full bg-[#efe7dd] relative overflow-hidden">
            {/* Chat Header */}
            <div className="h-16 px-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-30 relative shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {activeChat?.client_avatar ? (
                            <img
                                src={activeChat.client_avatar}
                                alt={activeChat.client_name}
                                className="w-10 h-10 rounded-full object-cover border border-orange-100"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
                                {activeChat?.client_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase leading-tight">{activeChat?.client_name}</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">En línea</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Local Search Input Toggle */}
                    {showLocalSearch ? (
                        <div className="flex items-center bg-gray-50 rounded-full pr-1 animate-in slide-in-from-right-2 border border-gray-100">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-xs py-1.5 pl-3 w-32 md:w-48 text-gray-700 font-medium"
                            />
                            <button
                                onClick={() => { setShowLocalSearch(false); setLocalSearchQuery(''); }}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLocalSearch(true)}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            title="Buscar en chat"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}

                </div>
            </div>

            {/* Messages Area with WA Background Pattern */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative"
                style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px',
                }}
            >
                {/* Overlay semi-transparente para suavizar el patrón */}
                <div className="absolute inset-0 bg-[#efe7dd]/90 pointer-events-none" />

                <div className="max-w-3xl mx-auto space-y-2 relative z-10">
                    {currentMessages.length === 0 && localSearchQuery && (
                        <div className="text-center py-20">
                            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl inline-block border border-white shadow-xl">
                                <Search className="w-10 h-10 text-orange-200 mx-auto mb-3" />
                                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Sin resultados</p>
                                <p className="text-xs text-slate-400 font-bold">No encontramos "{localSearchQuery}"</p>
                            </div>
                        </div>
                    )}
                    {currentMessages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] relative shrink-0">
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-100 rounded-xl shadow-xl flex gap-2 flex-wrap max-w-[300px] z-50 animate-in fade-in slide-in-from-bottom-2">
                        {commonEmojis.map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                    setInputText(prev => prev + emoji);
                                    setShowEmojiPicker(false);
                                }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-orange-50 rounded transition-colors text-xl"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-orange-600 bg-orange-50' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Escribe un mensaje"
                        className="flex-1 py-3 px-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-100 text-slate-700 placeholder:text-slate-400 transition-all font-bold"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="w-11 h-11 flex items-center justify-center bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full bg-[#efeae2]">
            <div className="w-32 h-32 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-sm border border-white">
                <MessageSquare className="w-16 h-16 text-orange-200" />
            </div>
            <h2 className="text-xl font-black text-slate-700 mb-2 uppercase tracking-tight">Centro de Mensajería SastrePro</h2>
            <p className="max-w-md mb-8 text-sm font-bold text-slate-400 uppercase tracking-wide">Selecciona una conversación para ver el historial y responder a tus clientes. Conexión en tiempo real activa.</p>
        </div>
    );

    const InfoPanelContent = activeChat ? (
        <div className="flex flex-col h-full bg-white">
            {/* Header Mini */}
            <div className="p-8 pb-4 text-center border-b border-gray-50">
                {activeChat.client_avatar ? (
                    <img
                        src={activeChat.client_avatar}
                        alt={activeChat.client_name}
                        className="w-24 h-24 rounded-3xl mx-auto mb-4 object-cover shadow-sm border border-white"
                    />
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-orange-600 shadow-sm border border-white">
                        {activeChat.client_name.charAt(0).toUpperCase()}
                    </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-tight">{activeChat.client_name}</h3>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    {activeChat.client_phone}
                </div>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto">
                {/* Stats / Info List */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Detalles del Cliente</h4>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Info className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Estado</p>
                            <p className="text-sm font-bold text-gray-700 capitalize">{activeChat.status || 'Nuevo'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Calendar className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Última Actividad</p>
                            <p className="text-sm font-bold text-gray-700">
                                {formatDistanceToNow(new Date(activeChat.last_message_at), { addSuffix: true, locale: es })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sentiment Section */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Análisis de Perfil</h4>
                    <div className="p-4 bg-purple-50/50 rounded-3xl border border-purple-100">
                        <p className="text-xs text-purple-700/70 font-bold uppercase mb-2">Sentimiento Predominante</p>
                        <div className="flex items-center gap-2">
                            <SentimentBadge sentiment={activeChat.sentiment_score} showLabel />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky bottom indicator */}
            <div className="mt-auto p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Sincronizado con CRM
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
