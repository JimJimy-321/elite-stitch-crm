"use client";

import React, { useState } from 'react';
import { Search, Send, MoreHorizontal, User, CheckCheck, Smile, Meh, Frown, Paperclip, Mic, Phone, Video, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Chat {
    id: number;
    client: string;
    lastMessage: string;
    time: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    unread: number;
    avatar?: string;
}

const mockMessages: Chat[] = [
    { id: 1, client: "Carlos Fuentes", lastMessage: "¿Mi traje para el sábado estará listo?", time: "10:15", sentiment: "neutral", unread: 2 },
    { id: 2, client: "Mariana Sosa", lastMessage: "¡Me encantó como quedó el vestido! Mil gracias.", time: "09:30", sentiment: "positive", unread: 0 },
    { id: 3, client: "Roberto Gomez", lastMessage: "Sigo esperando el presupuesto desde ayer...", time: "Ayer", sentiment: "negative", unread: 1 },
];

const sentimentIcons: Record<'positive' | 'neutral' | 'negative', { icon: any; color: string; label: string }> = {
    positive: { icon: Smile, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Positivo" },
    neutral: { icon: Meh, color: "text-blue-500 bg-blue-500/10 border-blue-500/20", label: "Neutral" },
    negative: { icon: Frown, color: "text-red-500 bg-red-500/10 border-red-500/20", label: "Crítico" },
};

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState(mockMessages[0]);

    return (
        <div className="h-[calc(100vh-160px)] flex glass-card overflow-hidden animate-fade-in">
            {/* Sidebar - Chats List */}
            <div className="w-96 border-r border-border flex flex-col bg-card/30">
                <div className="p-8 border-b border-border space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Mensajes</h2>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <span className="text-[10px] font-black text-primary">3</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-secondary/50 px-5 py-3 rounded-2xl border border-border focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-inner">
                        <Search className="text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar chats..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium text-foreground placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {mockMessages.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={cn(
                                "p-6 flex items-start gap-4 cursor-pointer hover:bg-secondary/30 transition-all border-b border-border/50 relative group",
                                selectedChat.id === chat.id && "bg-secondary/40 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary"
                            )}
                        >
                            <div className="relative">
                                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center border border-border group-hover:scale-105 transition-transform shadow-inner">
                                    <User size={28} className="text-muted-foreground" />
                                </div>
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-card flex items-center justify-center",
                                    sentimentIcons[chat.sentiment].color
                                )}>
                                    {React.createElement(sentimentIcons[chat.sentiment].icon, { size: 12 })}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-sm text-foreground truncate tracking-tight">{chat.client}</h4>
                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{chat.time}</span>
                                </div>
                                <p className={cn(
                                    "text-xs truncate transition-colors",
                                    chat.unread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                                )}>
                                    {chat.lastMessage}
                                </p>
                            </div>

                            {chat.unread > 0 && (
                                <div className="mt-6 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="text-[10px] font-black text-white">{chat.unread}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-card/10">
                {/* Chat Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center border border-border shadow-inner">
                            <User size={24} className="text-muted-foreground" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-foreground tracking-tight">{selectedChat.client}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">En línea</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm",
                            sentimentIcons[selectedChat.sentiment].color
                        )}>
                            {React.createElement(sentimentIcons[selectedChat.sentiment].icon, { size: 14 })}
                            <span>Sentimiento {sentimentIcons[selectedChat.sentiment].label}</span>
                        </div>
                        <div className="h-8 w-px bg-border mx-2" />
                        <div className="flex gap-1">
                            <HeaderAction icon={Phone} />
                            <HeaderAction icon={Video} />
                            <HeaderAction icon={SearchIcon} />
                            <HeaderAction icon={MoreHorizontal} />
                        </div>
                    </div>
                </div>

                {/* Messages Flow */}
                <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] bg-fixed custom-scrollbar">
                    <div className="flex justify-center">
                        <span className="px-4 py-1.5 bg-secondary/80 backdrop-blur-sm text-[9px] font-black text-muted-foreground rounded-full border border-border uppercase tracking-[0.2em] shadow-sm">Hoy, 20 de Octubre</span>
                    </div>

                    {/* Inbound */}
                    <div className="flex flex-col items-start max-w-[70%] group">
                        <div className="bg-card border border-border p-5 rounded-3xl rounded-tl-none text-sm font-medium text-foreground shadow-sm group-hover:shadow-md transition-shadow leading-relaxed">
                            {selectedChat.lastMessage}
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-3 ml-2 font-black uppercase tracking-widest">{selectedChat.time}</span>
                    </div>

                    {/* Outbound (Mock) */}
                    <div className="flex flex-col items-end self-end max-w-[70%] group">
                        <div className="bg-primary p-5 rounded-3xl rounded-tr-none text-sm font-bold text-white shadow-xl shadow-primary/10 group-hover:shadow-primary/20 transition-all leading-relaxed">
                            Hola {selectedChat.client.split(' ')[0]}, estamos revisando el estatus de su prenda en el taller. En un momento le confirmamos la fecha de entrega exacta vía este canal.
                        </div>
                        <div className="flex items-center gap-2 mt-3 mr-2">
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">10:45</span>
                            <CheckCheck size={14} className="text-primary" />
                        </div>
                    </div>
                </div>

                {/* Chat Input */}
                <div className="p-8 border-t border-border bg-card/50">
                    <div className="flex items-center gap-4 bg-secondary/50 p-2 pl-6 rounded-[2rem] border border-border focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-inner">
                        <button className="text-muted-foreground hover:text-primary transition-colors p-2">
                            <Smile size={22} />
                        </button>
                        <button className="text-muted-foreground hover:text-primary transition-colors p-2">
                            <Paperclip size={22} />
                        </button>
                        <input
                            type="text"
                            placeholder="Escribe un mensaje de respuesta..."
                            className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                        />
                        <div className="flex items-center gap-2 pr-2">
                            <button className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                                <Mic size={22} />
                            </button>
                            <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
                                <Send size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeaderAction({ icon: Icon }: { icon: any }) {
    return (
        <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <Icon size={20} />
        </button>
    );
}

