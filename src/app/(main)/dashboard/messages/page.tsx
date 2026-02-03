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
        <div className="h-[calc(100vh-160px)] flex glass-card border-none shadow-2xl overflow-hidden animate-fade-in bg-white rounded-[2.5rem]">
            {/* Sidebar - Chats List */}
            <div className="w-96 border-r border-slate-50 flex flex-col bg-slate-50/30">
                <div className="p-10 border-b border-slate-50 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Chat Center</h2>
                        <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 font-black text-xs">
                            3
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                        <Search className="text-slate-300 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar en mensajes..."
                            className="bg-transparent border-none outline-none text-sm w-full font-bold text-foreground placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {mockMessages.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={cn(
                                "p-6 flex items-start gap-5 cursor-pointer rounded-[2rem] transition-all relative group mb-2",
                                selectedChat.id === chat.id
                                    ? "bg-white shadow-xl shadow-slate-200/50 border border-slate-100"
                                    : "hover:bg-white/50 border border-transparent"
                            )}
                        >
                            <div className="relative">
                                <div className={cn(
                                    "w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center border border-slate-200 transition-all shadow-inner",
                                    selectedChat.id === chat.id && "border-orange-500/30 bg-orange-50"
                                )}>
                                    <User size={32} className={cn("text-slate-400 transition-colors", selectedChat.id === chat.id && "text-orange-600")} />
                                </div>
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center shadow-sm",
                                    sentimentIcons[chat.sentiment].color
                                )}>
                                    {React.createElement(sentimentIcons[chat.sentiment].icon, { size: 14 })}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className={cn("font-black text-[15px] truncate tracking-tight transition-colors", selectedChat.id === chat.id ? "text-orange-600" : "text-foreground")}>{chat.client}</h4>
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{chat.time}</span>
                                </div>
                                <p className={cn(
                                    "text-xs truncate transition-colors leading-relaxed",
                                    chat.unread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                                )}>
                                    {chat.lastMessage}
                                </p>
                            </div>

                            {chat.unread > 0 && (
                                <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/40 border-2 border-white" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/10">
                {/* Chat Header */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                            <User size={28} className="text-orange-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg text-foreground tracking-tight">{selectedChat.client}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">En línea ahora</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "hidden md:flex items-center gap-3 px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm",
                            sentimentIcons[selectedChat.sentiment].color
                        )}>
                            {React.createElement(sentimentIcons[selectedChat.sentiment].icon, { size: 16 })}
                            <span>Sentimiento {sentimentIcons[selectedChat.sentiment].label}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-100 mx-1" />
                        <div className="flex gap-2">
                            <HeaderAction icon={Phone} />
                            <HeaderAction icon={Video} />
                            <HeaderAction icon={SearchIcon} />
                            <HeaderAction icon={MoreHorizontal} />
                        </div>
                    </div>
                </div>

                {/* Messages Flow */}
                <div className="flex-1 p-10 overflow-y-auto space-y-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed custom-scrollbar">
                    <div className="flex justify-center">
                        <span className="px-6 py-2 bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-400 rounded-2xl border border-slate-100 uppercase tracking-[0.25em] shadow-sm italic">Hoy, 20 de Octubre</span>
                    </div>

                    {/* Inbound */}
                    <div className="flex flex-col items-start max-w-[75%] group">
                        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] rounded-tl-none text-[15px] font-medium text-foreground shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all leading-relaxed">
                            {selectedChat.lastMessage}
                        </div>
                        <span className="text-[9px] text-slate-300 mt-4 ml-4 font-black uppercase tracking-[0.2em]">{selectedChat.client} · {selectedChat.time}</span>
                    </div>

                    {/* Outbound (Mock) */}
                    <div className="flex flex-col items-end self-end max-w-[75%] group">
                        <div className="bg-orange-500 p-6 rounded-[2rem] rounded-tr-none text-[15px] font-black text-white shadow-2xl shadow-orange-500/20 group-hover:bg-orange-600 transition-all leading-relaxed">
                            Hola {selectedChat.client.split(' ')[0]}, estamos revisando el estatus de su prenda en el taller. En un momento le confirmamos la fecha de entrega exacta vía este canal.
                        </div>
                        <div className="flex items-center gap-3 mt-4 mr-4">
                            <span className="text-[9px] text-orange-500 font-black uppercase tracking-[0.2em]">SastrePro AI · 10:45</span>
                            <CheckCheck size={16} className="text-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Chat Input */}
                <div className="p-10 border-t border-slate-50 bg-white">
                    <div className="flex items-center gap-4 bg-slate-50 p-2 pl-8 rounded-[2.5rem] border border-slate-100 focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-500/20 transition-all shadow-inner">
                        <button className="text-slate-300 hover:text-orange-500 transition-colors p-3 hover:bg-white rounded-2xl shadow-sm">
                            <Smile size={24} />
                        </button>
                        <button className="text-slate-300 hover:text-orange-500 transition-colors p-3 hover:bg-white rounded-2xl shadow-sm">
                            <Paperclip size={24} />
                        </button>
                        <input
                            type="text"
                            placeholder="Escribe un mensaje de respuesta..."
                            className="flex-1 bg-transparent border-none outline-none px-4 text-[15px] font-bold text-foreground placeholder:text-slate-300"
                        />
                        <div className="flex items-center gap-3 pr-2">
                            <button className="w-14 h-14 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 hover:shadow-lg transition-all shadow-sm active:scale-90">
                                <Mic size={24} />
                            </button>
                            <button className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 hover:scale-110 active:scale-90 transition-all shadow-2xl shadow-orange-500/30">
                                <Send size={24} />
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
        <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-[1.25rem] transition-all border border-transparent hover:border-orange-500/20 active:scale-95 shadow-sm hover:shadow-inner">
            <Icon size={22} />
        </button>
    );
}

