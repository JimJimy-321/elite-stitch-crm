"use client";

import React, { useState } from 'react';
import { Megaphone, Send, Image as ImageIcon, Users, MessageSquare, Sparkles, Clock, CheckCircle2, Wand2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function MarketingPage() {
    const [msg, setMsg] = useState("");
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(false);

    const handleSend = () => {
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setDone(true);
            setTimeout(() => setDone(false), 3000);
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                        <Megaphone className="text-primary" size={28} />
                    </div>
                    Campañas de WhatsApp
                </h1>
                <p className="text-muted-foreground text-sm">Envía promociones y avisos a toda tu base de clientes automáticamente con IA.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-1">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <MessageSquare size={18} className="text-primary" />
                                    Nueva Campaña Masiva
                                </h3>
                                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 tracking-widest">
                                    842 Clientes Seleccionados
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3 px-1">Mensaje de Campaña</label>
                                    <textarea
                                        value={msg}
                                        onChange={(e) => setMsg(e.target.value)}
                                        placeholder="Hola {{nombre}}, tenemos una promoción exclusiva para ti..."
                                        className="w-full h-48 bg-secondary/50 border border-border rounded-2xl p-6 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all shadow-inner font-medium"
                                    />
                                    <button className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all group-hover:opacity-100 opacity-80 border border-white/20">
                                        <Wand2 size={16} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 px-1">
                                    <VariableBadge label="{{nombre}}" />
                                    <VariableBadge label="{{ultimo_servicio}}" />
                                    <VariableBadge label="{{sucursal}}" />
                                    <VariableBadge label="{{folio_ticket}}" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 py-3.5 bg-secondary text-foreground rounded-xl border border-border hover:bg-card hover:border-primary/30 transition-all font-bold text-xs uppercase tracking-widest">
                                        <ImageIcon size={16} className="text-primary" />
                                        Adjuntar Imagen
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-3.5 bg-secondary text-foreground rounded-xl border border-border hover:bg-card hover:border-primary/30 transition-all font-bold text-xs uppercase tracking-widest">
                                        <Clock size={16} className="text-primary" />
                                        Programar Envío
                                    </button>
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={sending || !msg}
                                    className={cn(
                                        "w-full btn-primary py-4 text-[13px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all relative overflow-hidden",
                                        (!msg || sending) && "opacity-50 cursor-not-allowed grayscale"
                                    )}
                                >
                                    {sending ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : done ? (
                                        <span className="flex items-center gap-2 animate-bounce">
                                            <CheckCircle2 size={18} /> ¡Campaña en Proceso!
                                        </span>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Lanzar Campaña Ahora
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audience & AI Tips */}
                <div className="space-y-6">
                    <div className="glass-card p-6 border-l-4 border-l-primary bg-primary/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="text-primary" size={18} />
                            </div>
                            <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Sastre AI Optimizer</h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                            Tu audiencia actual responde mejor los <span className="text-primary font-black">Martes a las 11:00 AM</span>.
                            Usar el nombre del cliente aumenta el CTR en un <span className="text-emerald-500 font-bold">24%</span> según tus logs históricos.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center justify-between text-foreground">
                            Segmentación
                            <Users size={16} className="text-primary/50" />
                        </h3>
                        <div className="space-y-2">
                            <SegmentItem label="Todos los clientes" count="842" active />
                            <SegmentItem label="Clientes frecuentes" count="128" />
                            <SegmentItem label="Retención (> 3 meses)" count="215" />
                            <SegmentItem label="Sucursal Matriz" count="452" />
                        </div>
                        <button className="w-full mt-6 py-3 border border-dashed border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
                            + Crear Segmento IA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VariableBadge({ label }: { label: string }) {
    return (
        <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border cursor-pointer hover:border-primary/50 hover:text-primary transition-colors">
            {label}
        </span>
    );
}

function SegmentItem({ label, count, active }: any) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3.5 rounded-xl border transition-all group cursor-pointer",
            active
                ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                : "bg-secondary/30 border-border hover:border-primary/30 hover:bg-card"
        )}>
            <span className="text-[11px] font-bold tracking-tight">{label}</span>
            <span className={cn(
                "text-[10px] font-black px-2 py-0.5 rounded-lg",
                active ? "bg-primary text-white" : "bg-card text-muted-foreground group-hover:text-primary transition-colors"
            )}>{count}</span>
        </div>
    );
}

