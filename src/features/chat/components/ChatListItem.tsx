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
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <User className="w-6 h-6" />
                </div>
                {conversation.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conversation.unread_count}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.client_name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: es })}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {conversation.last_message_content || 'Iniciar conversación...'}
                    </p>
                    {conversation.sentiment_score && (
                        <SentimentBadge sentiment={conversation.sentiment_score} />
                    )}
                </div>
            </div>
        </div>
    );
}
