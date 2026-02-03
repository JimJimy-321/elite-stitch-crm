"use client";

import React, { useState } from 'react';
import { Megaphone, Send, Image as ImageIcon, Users, MessageSquare, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
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
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <Megaphone className="text-accent" />
                    Campañas masivas de WhatsApp
                </h1>
                <p className="text-muted text-sm">Envía promociones y avisos a toda tu base de clientes automáticamente.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <MessageSquare size={18} className="text-accent" />
                                Nueva Campaña
                            </h3>
                            <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-2 py-1 rounded-md">842 Clientes Seleccionados</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted block mb-2">Mensaje (Soporta Variables)</label>
                                <textarea
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    placeholder="Hola {{nombre}}, tenemos una promoción exclusiva para ti..."
                                    className="w-full h-40 bg-slate-100 dark:bg-slate-800/50 border border-border rounded-2xl p-4 text-sm resize-none focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                />
                                <p className="text-[10px] text-muted mt-2 italic">Variables disponibles: &#123;&#123;nombre&#125;&#125;, &#123;&#123;ultimo_servicio&#125;&#125;, &#123;&#123;sucursal&#125;&#125;.</p>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary rounded-xl border border-border hover:bg-secondary/80 transition-all font-bold text-sm">
                                    <ImageIcon size={18} className="text-muted" />
                                    Adjuntar Imagen
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary rounded-xl border border-border hover:bg-secondary/80 transition-all font-bold text-sm">
                                    <Clock size={18} className="text-muted" />
                                    Programar Envío
                                </button>
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={sending || !msg}
                                className={cn(
                                    "w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl transition-all",
                                    (!msg || sending) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {sending ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : done ? (
                                    <span className="flex items-center gap-2 animate-bounce">
                                        <CheckCircle2 /> ¡Campaña enviada!
                                    </span>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Lanzar Campaña Ahora
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audience & AI Tips */}
                <div className="space-y-6">
                    <div className="glass-card p-6 border-l-4 border-l-accent">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-accent" size={20} />
                            <h3 className="font-bold">IA Optimizer</h3>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                            Tu audiencia actual responde mejor los <span className="text-foreground font-bold">Martes a las 11:00 AM</span>. Hemos detectado que usar el nombre del cliente aumenta el CTR en un <span className="text-emerald-500 font-bold">24%</span>.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 flex items-center justify-between">
                            Segmentación
                            <Users size={16} className="text-muted" />
                        </h3>
                        <div className="space-y-3">
                            <SegmentItem label="Todos los clientes" count="842" active />
                            <SegmentItem label="Clientes frecuentes" count="128" />
                            <SegmentItem label="Inactivos (> 3 meses)" count="215" />
                            <SegmentItem label="Por sucursal (Matriz)" count="452" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SegmentItem({ label, count, active }: any) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer transition-all",
            active ? "bg-accent/10 border-accent/40 text-accent" : "hover:bg-secondary"
        )}>
            <span className="text-xs font-bold">{label}</span>
            <span className="text-[10px] font-black">{count}</span>
        </div>
    );
}
