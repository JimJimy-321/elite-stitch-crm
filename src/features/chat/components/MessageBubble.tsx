import { ChatMessage } from '../types/chat';
import { format } from 'date-fns';
import { Check, CheckCheck, FileText } from 'lucide-react';
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
                    <div className="flex flex-col gap-2">
                        {message.media_url && (
                            <div className="rounded-md overflow-hidden max-w-[250px] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-1">
                                {message.media_type === 'image' ? (
                                    <img
                                        src={message.media_url}
                                        alt={message.content}
                                        className="max-w-full h-auto object-contain rounded"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-white/50 w-full rounded">
                                        <FileText className="w-8 h-8 text-orange-500" />
                                        <div className="flex-1 overflow-hidden">
                                            <a
                                                href={message.media_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] text-blue-500 font-black uppercase hover:underline"
                                            >
                                                Descargar
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {message.content && (
                            <p className={`whitespace-pre-wrap leading-relaxed ${message.media_url ? 'mt-2 text-xs font-semibold' : ''}`}>
                                {message.content}
                            </p>
                        )}
                    </div>

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
                            <div className="flex items-center">
                                {message.status === 'sending' ? (
                                    <div className="w-3 h-3 border-b border-gray-400 rounded-full animate-spin" />
                                ) : message.is_read ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                ) : message.status === 'delivered' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                                ) : message.status === 'sent' ? (
                                    <Check className="w-3.5 h-3.5 text-gray-400" />
                                ) : message.status === 'failed' ? (
                                    <span className="text-red-500 text-[8px] font-bold">!</span>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
