import { ChatConversation } from '../types/chat';
import { SentimentBadge } from './SentimentBadge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, MessageSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
    conversation: ChatConversation;
    isActive: boolean;
    onClick: () => void;
}

export function ChatListItem({ conversation, isActive, onClick }: Props) {
    const hasValidAvatar = conversation.client_avatar && !conversation.client_avatar.includes('avatar-placeholder');

    return (
        <div
            onClick={onClick}
            className={`w-full p-4 flex gap-3 cursor-pointer transition-all border-b border-gray-50 ${isActive
                ? 'bg-orange-50/50 border-l-4 border-l-orange-500 shadow-sm z-10'
                : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                {hasValidAvatar ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                        <img
                            src={conversation.client_avatar}
                            alt={conversation.client_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-sm transition-all group-hover:scale-110",
                        (conversation.client_name?.length || 0) % 3 === 0 ? "bg-gradient-to-br from-orange-400 to-rose-500" :
                            (conversation.client_name?.length || 0) % 2 === 0 ? "bg-gradient-to-br from-indigo-400 to-purple-600" :
                                "bg-gradient-to-br from-emerald-400 to-teal-600"
                    )}>
                        {conversation.client_name?.[0]?.toUpperCase() || 'D'}
                    </div>
                )}
                {conversation.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        {conversation.unread_count}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <div className="flex flex-col min-w-0">
                        <h3 className={`font-semibold truncate transition-colors text-sm tracking-tight ${isActive ? 'text-orange-900' : 'text-slate-800'}`}>
                            {conversation.client_name}
                        </h3>
                        {conversation.client_phone && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-gray-400 font-bold tabular-nums leading-none">
                                    {conversation.client_phone}
                                </p>
                                {conversation.branch_name && (
                                    <span className={cn(
                                        "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm",
                                        conversation.branch_name.toLowerCase().includes('elite') ? "bg-orange-100 text-orange-600 border border-orange-200" :
                                        conversation.branch_name.toLowerCase().includes('refugio') ? "bg-emerald-100 text-emerald-600 border border-emerald-200" :
                                        "bg-slate-100 text-slate-600 border border-slate-200"
                                    )}>
                                        {conversation.branch_name}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2 opacity-80">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: es })}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <p className={`text-xs ${isActive ? 'text-orange-900/60' : 'text-slate-400'} truncate font-medium`}>
                        {conversation.last_message_content === 'Imagen recibida' ? '📷 Imagen' :
                            conversation.last_message_content === 'Sticker recibido' ? '🎨 Sticker' :
                                (conversation.last_message_content && (conversation.last_message_content.includes('http') || /\.(jpg|jpeg|png|gif|pdf|doc|docx|mp4|m4a|mp3)$/i.test(conversation.last_message_content))) ? '📁 Archivo/Multimedia' :
                                    conversation.last_message_content || 'Iniciar conversación...'}
                    </p>
                    {conversation.sentiment_score && (
                        <div className="shrink-0 scale-90 origin-right">
                            <SentimentBadge sentiment={conversation.sentiment_score} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
