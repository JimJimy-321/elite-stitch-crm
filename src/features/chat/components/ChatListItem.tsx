import { ChatConversation } from '../types/chat';
import { SentimentBadge } from './SentimentBadge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, MessageSquare } from 'lucide-react';

interface Props {
    conversation: ChatConversation;
    isActive: boolean;
    onClick: () => void;
}

export function ChatListItem({ conversation, isActive, onClick }: Props) {
    return (
        <div
            onClick={onClick}
            className={`w-full p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${isActive
                ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-l-transparent'
                }`}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                {conversation.client_avatar ? (
                    <img
                        src={conversation.client_avatar}
                        alt={conversation.client_name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-100"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
                        {conversation.client_name.charAt(0).toUpperCase()}
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
                <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-black truncate ${isActive ? 'text-orange-600' : 'text-slate-900'} uppercase transition-colors text-sm tracking-tight`}>
                        {conversation.client_name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2 opacity-80">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: es })}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <p className={`text-xs ${isActive ? 'text-orange-800/70' : 'text-slate-500'} truncate font-bold`}>
                        {conversation.last_message_content === 'Imagen recibida' ? '📷 Imagen' :
                            conversation.last_message_content === 'Sticker recibido' ? '🎨 Sticker' :
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
