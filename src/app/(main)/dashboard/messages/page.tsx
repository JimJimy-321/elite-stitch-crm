"use client";

import React, { useState } from 'react';
import { Search, Send, MoreHorizontal, User, CheckCheck, Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const mockMessages = [
    { id: 1, client: "Carlos Fuentes", lastMessage: "¿Mi traje para el sábado estará listo?", time: "10:15", sentiment: "neutral", unread: 2 },
    { id: 2, client: "Mariana Sosa", lastMessage: "¡Me encantó como quedó el vestido! Mil gracias.", time: "09:30", sentiment: "positive", unread: 0 },
    { id: 3, client: "Roberto Gomez", lastMessage: "Sigo esperando el presupuesto desde ayer...", time: "Ayer", sentiment: "negative", unread: 1 },
];

const sentimentIcons: any = {
    positive: { icon: Smile, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    neutral: { icon: Meh, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    negative: { icon: Frown, color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState(mockMessages[0]);

    return (
        <div className="h-[calc(100vh-160px)] flex glass-card overflow-hidden">
            {/* Sidebar - Chats List */}
            <div className="w-96 border-r border-border flex flex-col">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold mb-4">Mensajes</h2>
                    <div className="flex items-center gap-3 bg-secondary/50 px-3 py-2 rounded-xl border border-border">
                        <Search className="text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar chats..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {mockMessages.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={cn(
                                "p-4 flex items-start gap-4 cursor-pointer hover:bg-secondary/30 transition-colors border-b border-border/50",
                                selectedChat.id === chat.id && "bg-secondary/40"
                            )}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center border border-border">
                                    <User size={24} className="text-muted" />
                                </div>
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center p-0.5",
                                    sentimentIcons[chat.sentiment].color
                                )}>
                                    {React.createElement(sentimentIcons[chat.sentiment].icon, { size: 12 })}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm truncate">{chat.client}</h4>
                                    <span className="text-[10px] text-muted font-bold uppercase">{chat.time}</span>
                                </div>
                                <p className="text-xs text-muted truncate">{chat.lastMessage}</p>
                            </div>

                            {chat.unread > 0 && (
                                <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center ml-2">
                                    <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background/20">
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-card/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border border-border">
                            <User size={20} className="text-muted" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">{selectedChat.client}</h4>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className={cn(
                            "px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                            sentimentIcons[selectedChat.sentiment].color
                        )}>
                            {React.createElement(sentimentIcons[selectedChat.sentiment].icon, { size: 14 })}
                            <span>{selectedChat.sentiment} sentiment</span>
                        </div>
                        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                            <MoreHorizontal size={20} className="text-muted" />
                        </button>
                    </div>
                </div>

                {/* Messages Flow */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div className="flex justify-center">
                        <span className="px-3 py-1 bg-secondary text-[10px] font-bold text-muted rounded-full uppercase tracking-widest">Hoy</span>
                    </div>

                    {/* Inbound */}
                    <div className="flex flex-col items-start max-w-[70%]">
                        <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-none border border-border text-sm">
                            {selectedChat.lastMessage}
                        </div>
                        <span className="text-[10px] text-muted mt-2 ml-1 uppercase">{selectedChat.time}</span>
                    </div>

                    {/* Outbound (Mock) */}
                    <div className="flex flex-col items-end self-end max-w-[70%]">
                        <div className="bg-accent p-4 rounded-2xl rounded-tr-none text-sm text-white shadow-lg shadow-accent/20">
                            Estamos revisando el estatus de su prenda. En un momento le confirmamos la fecha de entrega exacta.
                        </div>
                        <div className="flex items-center gap-1 mt-2 mr-1">
                            <span className="text-[10px] text-muted uppercase">10:45</span>
                            <CheckCheck size={12} className="text-accent" />
                        </div>
                    </div>
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-border bg-card/30">
                    <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl border border-border">
                        <input
                            type="text"
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-transparent border-none outline-none px-4 text-sm"
                        />
                        <button className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
