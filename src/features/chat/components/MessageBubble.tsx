import { ChatMessage } from '../types/chat';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { SentimentBadge } from './SentimentBadge';

interface Props {
    message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
    const isMe = message.sender_role === 'agent' || message.sender_role === 'bot';

    return (
        <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] sm:max-w-[60%] relative group`}>

                {/* Bubble Container */}
                <div className={`relative px-4 py-2 rounded-lg shadow-sm text-sm ${isMe
                        ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-none'
                        : 'bg-white dark:bg-[#1C1A22] text-gray-900 dark:text-gray-100 rounded-tl-none'
                    }`}>
                    {/* Content */}
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </p>

                    {/* Metadata: Time + Status */}
                    <div className="flex items-center justify-end gap-1 mt-1 select-none">
                        {/* Solo mostrar sentimiento si es cliente y es crítico/positivo, para no saturar */}
                        {!isMe && message.sentiment && message.sentiment !== 'neutral' && (
                            <div className="scale-75 origin-right opacity-70">
                                <SentimentBadge sentiment={message.sentiment} />
                            </div>
                        )}

                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {format(new Date(message.created_at), 'HH:mm')}
                        </span>

                        {isMe && (
                            <span className={message.is_read ? 'text-blue-500' : 'text-gray-400'}>
                                {message.is_read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
