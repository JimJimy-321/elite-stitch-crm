'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { ChatListItem } from '@/features/chat/components/ChatListItem';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { ChatConversation, ChatMessage } from '@/features/chat/types/chat';
import { chatService } from '@/features/chat/services/chatService';
import { useChatStore } from '@/features/chat/store/chatStore';
import { createClient } from '@/lib/supabase/client';
import { Send, Paperclip, MoreVertical, Search, MessageSquare, ExternalLink, FileText, Smile, User, Phone, Calendar, Info, X, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { SentimentBadge } from '@/features/chat/components/SentimentBadge';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { hasProfanity, getOffensiveWords } from '@/shared/lib/profanity-filter';
import { Edit2, Check, RotateCcw } from 'lucide-react';

export default function ChatPage() {
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [showLocalSearch, setShowLocalSearch] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [newChatPhone, setNewChatPhone] = useState('');
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const router = useRouter();
    const {
        conversations,
        activeConversationId,
        messages,
        setConversations,
        setActiveConversation,
        addMessage,
        markAsRead: markAsReadInStore,
        createConversation
    } = useChatStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const commonEmojis = ['😊', '😂', '👍', '🙏', '❤️', '👏', '🔥', '📍', '✅', '🆗'];

    // Cargar conversaciones iniciales
    useEffect(() => {
        const loadChats = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('assigned_branch_id')
                    .eq('id', user.id)
                    .single();

                const chats = await chatService.getConversations(profile?.assigned_branch_id);
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
    }, [activeConversationId, markAsReadInStore, setConversations]);

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

    const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);

    // Obtener el branchId del usuario para filtrar el Realtime
    useEffect(() => {
        const getProfileInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('assigned_branch_id')
                    .eq('id', user.id)
                    .single();
                
                setCurrentBranchId(profile?.assigned_branch_id);
            }
        };
        getProfileInfo();
    }, []);

    useEffect(() => {
        if (!currentBranchId) return;

        const channel = supabase
            .channel('chat_realtime_v2')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages'
            }, async (payload) => {
                const newMsg = payload.new as any;
                
                // Necesitamos verificar que el mensaje sea de una conversacion de ESTA sucursal.
                // Como 'chat_messages' no tiene branch_id, dependemos de que el estado de 'conversations' lo tenga.
                // Si la converacion existe en nuestro estado (que ya está filtrado por sucursal):
                const state = useChatStore.getState();
                if (state.conversations.some(c => c.id === newMsg.conversation_id)) {
                    addMessage(newMsg);

                    const currentActiveId = activeIdRef.current;

                    if (newMsg.conversation_id === currentActiveId && newMsg.sender_role === 'client') {
                        try {
                            if (currentActiveId) {
                                markAsReadInStore(currentActiveId);
                            }
                        } catch (e) {
                            console.error("Error auto-marking as read", e);
                        }
                    } else if (newMsg.sender_role === 'client') {
                        toast.info(`Nuevo mensaje de cliente`, {
                            icon: '💬',
                            position: 'bottom-right'
                        });
                    }
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_conversations',
                filter: `branch_id=eq.${currentBranchId}`
            }, (payload: any) => {
                const newConv = payload.new;
                const mappedConv = {
                    ...newConv,
                    client_name: newConv.client_name || 'Nuevo Contacto',
                    client_phone: newConv.customer_phone || '',
                    client_avatar: ''
                };
                setConversations((prev) => {
                    if (prev.some(c => c.id === mappedConv.id)) return prev;
                    return [mappedConv, ...prev];
                });
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_conversations',
                filter: `branch_id=eq.${currentBranchId}`
            }, (payload: any) => {
                const updatedConv = payload.new;
                setConversations((prev) => prev.map((c) =>
                    c.id === updatedConv.id
                        ? { ...c, ...updatedConv, client_name: c.client_name || updatedConv.client_name }
                        : c
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentBranchId, addMessage, setConversations, markAsReadInStore]);

    // Filtrar conversaciones por nombre o teléfono, y excluir el número del servidor
    const filteredConversations = useMemo(() => {
        const serverPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '5214421205583';
        const list = conversations.filter(c => c.client_phone !== serverPhone && c.customer_phone !== serverPhone);

        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(c =>
            c.client_name.toLowerCase().includes(q) ||
            c.client_phone.includes(q) ||
            (c.customer_phone && c.customer_phone.includes(q))
        );
    }, [conversations, searchQuery]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !activeConversationId) return;

        if (hasProfanity(inputText)) {
            const forbidden = getOffensiveWords(inputText);
            toast.error(`Mensaje bloqueado: SastrePro no permite lenguaje ofensivo (${forbidden.join(', ')})`, {
                position: 'top-center',
                duration: 5000,
            });
            return;
        }

        try {
            await chatService.sendMessage(activeConversationId, inputText, 'agent');
            setInputText('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error al enviar mensaje');
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConversationId) return;

        setIsUploading(true);
        const toastId = toast.loading('Subiendo archivo...');

        try {
            const { publicUrl, fileType } = await chatService.uploadFile(file);
            // ENVIAR UN SOLO MENSAJE CON MEDIA
            await chatService.sendMessage(activeConversationId, '', 'agent', publicUrl, fileType as any);
            toast.success('Archivo enviado correctamente', { id: toastId });
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Error al subir archivo', { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
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

    const handleUpdateName = async () => {
        if (!activeChat || !editedName.trim() || editedName === activeChat.client_name) {
            setIsEditingName(false);
            return;
        }

        if (!activeChat.client_id) {
            toast.error('Error: ID de cliente no encontrado');
            return;
        }

        setIsUpdatingName(true);
        try {
            await chatService.updateClientName(activeChat.client_id, editedName);

            // Actualizar localmente en el store
            setConversations(conversations.map(c =>
                c.id === activeConversationId
                    ? { ...c, client_name: editedName.toUpperCase() }
                    : c
            ));

            toast.success('Nombre actualizado correctamente');
            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating name:', error);
            toast.error('Error al actualizar el nombre');
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleCreateNewChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChatPhone.trim()) return;

        setIsCreatingChat(true);
        try {
            // Obtener contexto de organizacion y sucursal del usuario
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id, assigned_branch_id')
                .eq('id', user.id)
                .single();

            if (!profile) throw new Error('No profile found');

            const newConversation = await chatService.findOrCreateConversationByPhone(
                newChatPhone,
                profile.assigned_branch_id,
                profile.organization_id
            );

            // Añadir al store si no existe
            useChatStore.getState().createConversation(newConversation);

            // Activar
            setActiveConversation(newConversation.id);
            setShowNewChatModal(false);
            setNewChatPhone('');
            toast.success('Chat iniciado correctamente');
        } catch (error) {
            console.error('Error creating new chat:', error);
            toast.error('Error al iniciar el chat');
        } finally {
            setIsCreatingChat(false);
        }
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
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 border border-orange-500 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                        <Scissors className="text-white w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-gray-700">Chats</h2>
                </div>
                <button
                    onClick={() => setShowNewChatModal(true)}
                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm active:scale-95"
                    title="Nuevo Chat"
                >
                    <MessageSquare size={18} />
                </button>
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
        <div className="flex flex-col h-full bg-[#efe7dd] dark:bg-[#0b141a] relative overflow-hidden">
            {/* Background Pattern */}
            <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.15] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px',
                }}
            />

            {/* Chat Header */}
            <div className="h-16 px-4 bg-white/95 dark:bg-[#202c33]/95 backdrop-blur-sm border-b border-gray-100 dark:border-[#2a3942] flex items-center justify-between shadow-sm z-30 relative shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {activeChat?.client_avatar && !activeChat.client_avatar.includes('avatar-placeholder') ? (
                            <img
                                src={activeChat.client_avatar}
                                alt={activeChat.client_name}
                                className="w-10 h-10 rounded-full object-cover border border-orange-100 dark:border-[#2a3942]"
                            />
                        ) : null}
                        {!(activeChat?.client_avatar && !activeChat.client_avatar.includes('avatar-placeholder')) ? (
                            <div
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-500/20"
                            >
                                {activeChat?.client_name?.[0]?.toUpperCase() || '?'}
                            </div>
                        ) : null}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#202c33] rounded-full shadow-sm" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-gray-100 text-sm tracking-tight uppercase leading-tight">{activeChat?.client_name}</h3>
                        <div className="flex items-center gap-1.5">
                            <p className="text-[10px] font-bold text-gray-400 tabular-nums">{activeChat?.client_phone}</p>
                            <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <p className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">En línea</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Local Search Input Toggle */}
                    {showLocalSearch ? (
                        <div className="flex items-center bg-gray-50 dark:bg-[#2a3942] rounded-full pr-1 animate-in slide-in-from-right-2 border border-gray-100 dark:border-[#202c33]">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-xs py-1.5 pl-3 w-32 md:w-48 text-gray-700 dark:text-gray-200 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <button
                                onClick={() => { setShowLocalSearch(false); setLocalSearchQuery(''); }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLocalSearch(true)}
                            className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-full transition-colors"
                            title="Buscar en chat"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}

                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative z-10"
            >
                <div className="max-w-3xl mx-auto space-y-2 relative">
                    {currentMessages.length === 0 && localSearchQuery && (
                        <div className="text-center py-20">
                            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl inline-block border border-white shadow-xl">
                                <Search className="w-10 h-10 text-orange-200 mx-auto mb-3" />
                                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Sin resultados</p>
                                <p className="text-xs text-slate-400 font-bold">No encontramos "{localSearchQuery}"</p>
                            </div>
                        </div>
                    )}
                    {currentMessages.map((msg, index) => {
                        const prevMsg = index > 0 ? currentMessages[index - 1] : null;
                        const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.created_at), new Date(prevMsg.created_at));

                        let dateLabel = '';
                        if (showDateSeparator) {
                            const date = new Date(msg.created_at);
                            if (isToday(date)) dateLabel = 'Hoy';
                            else if (isYesterday(date)) dateLabel = 'Ayer';
                            else dateLabel = format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
                        }

                        return (
                            <div key={msg.id} className="space-y-2">
                                {showDateSeparator && (
                                    <div className="flex justify-center my-6 sticky top-2 z-20">
                                        <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm border border-white/50">
                                            {dateLabel}
                                        </span>
                                    </div>
                                )}
                                <MessageBubble message={msg} />
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-[#202c33] border-t border-gray-100 dark:border-[#2a3942] shadow-[0_-1px_3px_rgba(0,0,0,0.05)] relative shrink-0 z-20">
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
                    <button
                        type="button"
                        onClick={handleFileClick}
                        disabled={isUploading}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            isUploading ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:bg-slate-100"
                        )}
                    >
                        <Paperclip className={cn("w-5 h-5", isUploading && "animate-pulse")} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Escribe un mensaje"
                        rows={1}
                        className="flex-1 py-3 px-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-100 text-slate-700 placeholder:text-slate-400 transition-all font-bold resize-none overflow-hidden"
                        style={{ height: 'auto', minHeight: '48px', maxHeight: '120px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                        }}
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
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full bg-[#efeae2] dark:bg-[#111b21]">
            <div className="w-32 h-32 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-sm border border-white dark:border-white/5">
                <MessageSquare className="w-16 h-16 text-orange-200 dark:text-orange-900/60" />
            </div>
            <h2 className="text-xl font-black text-slate-700 mb-2 uppercase tracking-tight">Centro de Mensajería SastrePro</h2>
            <p className="max-w-md mb-8 text-sm font-bold text-slate-400 uppercase tracking-wide">Selecciona una conversación para ver el historial y responder a tus clientes. Conexión en tiempo real activa.</p>
        </div>
    );

    const InfoPanelContent = activeChat ? (
        <div className="flex flex-col h-full bg-white">
            {/* Header Mini */}
            <div className="p-8 pb-4 text-center border-b border-gray-50">
                {activeChat?.client_avatar && !activeChat.client_avatar.includes('avatar-placeholder') ? (
                    <div className="w-24 h-24 rounded-3xl mx-auto mb-4 overflow-hidden shadow-sm border border-white">
                        <img
                            src={activeChat.client_avatar}
                            alt={activeChat.client_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-orange-600 shadow-sm border border-white">
                        {activeChat?.client_name?.[0]?.toUpperCase() || '?'}
                    </div>
                )}
                <div className="flex flex-col items-center">
                    {isEditingName ? (
                        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                            <input
                                autoFocus
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                                className="w-full text-center text-lg font-bold border-2 border-orange-200 rounded-xl px-3 py-1 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                placeholder="Nombre del cliente"
                            />
                            <div className="flex gap-2">
                                <button
                                    disabled={isUpdatingName}
                                    onClick={handleUpdateName}
                                    className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={isUpdatingName}
                                    onClick={() => setIsEditingName(false)}
                                    className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 group">
                            <h3 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-tight">{activeChat.client_name}</h3>
                            <button
                                onClick={() => {
                                    setEditedName(activeChat.client_name);
                                    setIsEditingName(true);
                                }}
                                className="p-1 text-slate-300 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-medium">
                        <Phone className="w-3.5 h-3.5" />
                        {activeChat.client_phone}
                    </div>
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
        <div className="relative h-full">
            <ChatLayout
                sidebar={SidebarContent}
                chatWindow={ChatWindowContent}
                infoPanel={activeConversationId ? InfoPanelContent : undefined}
            />

            {/* Modal para Nuevo Chat */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-orange-500 rounded-xl">
                                    <MessageSquare size={20} className="text-white" />
                                </div>
                                Nuevo Chat
                            </h3>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateNewChat} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Número de WhatsApp</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        autoFocus
                                        required
                                        placeholder="Ej: 524421205583"
                                        value={newChatPhone}
                                        onChange={(e) => setNewChatPhone(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold placeholder:text-slate-300 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium pl-1 italic">Incluye el código de país sin el signo +</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isCreatingChat || !newChatPhone}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                            >
                                {isCreatingChat ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Iniciar Conversación
                                        <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
