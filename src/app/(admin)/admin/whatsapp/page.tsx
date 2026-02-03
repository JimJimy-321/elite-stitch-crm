"use client";

import React from 'react';
import { MessageSquare, ShieldCheck, Key, Smartphone, Plus, Settings, Globe, Zap, ExternalLink, Copy } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function AdminWhatsAppPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <MessageSquare className="text-primary" size={28} />
                        </div>
                        Configuración Core WhatsApp API
                    </h1>
                    <p className="text-muted-foreground text-sm">Gestión centralizada de tokens de acceso, Webhooks y Phone IDs globales.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Gateway Master Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Credentials Card */}
                <div className="glass-card bg-card/50 overflow-hidden group">
                    <div className="p-8 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                        <h3 className="font-black text-foreground flex items-center justify-between uppercase text-[11px] tracking-[0.2em]">
                            Meta Developer Credentials
                            <ShieldCheck className="text-primary" size={18} />
                        </h3>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Access Token</label>
                            <div className="relative group/token">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/token:text-primary transition-colors" size={16} />
                                <input
                                    type="password"
                                    value="EAAGm0PZC6ZCs0BAO6D..."
                                    readOnly
                                    className="w-full bg-secondary border border-border rounded-xl pl-12 pr-12 py-4 text-xs font-mono outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1">
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business Management ID</label>
                            <input
                                type="text"
                                value="342958012932"
                                readOnly
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-xs font-mono outline-none text-foreground/80"
                            />
                        </div>

                        <button className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-foreground/10 flex items-center justify-center gap-2">
                            <Zap size={14} />
                            Actualizar Claves Maestras
                        </button>
                    </div>
                </div>

                {/* Phones Card */}
                <div className="glass-card flex flex-col">
                    <div className="p-8 border-b border-border flex justify-between items-center">
                        <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em]">Cuentas de WhatsApp Activas</h3>
                        <button className="w-10 h-10 bg-primary/10 rounded-xl text-primary border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="p-4 flex-1 space-y-2">
                        <PhoneItem label="SastrePro Matriz" id="102938475" status="Online" />
                        <PhoneItem label="SastrePro Sede Sur" id="192837465" status="Online" />
                        <PhoneItem label="SastrePro Demo" id="000000000" status="Disconnected" />
                    </div>

                    <div className="p-6 border-t border-border">
                        <button className="w-full py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-2">
                            Ver documentación de API
                            <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Webhook Monitor */}
            <div className="glass-card p-1 group">
                <div className="p-8 flex items-center gap-6 bg-card/50 rounded-[2rem]">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <Settings size={28} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-foreground tracking-tight flex items-center gap-2">
                            Webhook Gateway Status
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                            Endpoint actual del listener global de SastrePro SaaS: <span className="text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">https://api.sastrepro.com/wh/v1</span>
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-secondary border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all">
                        Test Webhook
                    </button>
                </div>
            </div>
        </div>
    );
}

function PhoneItem({ label, id, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-secondary/30 border border-border/50 rounded-2xl hover:bg-secondary/60 transition-all group/item">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-card rounded-xl border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:border-primary/30 transition-all shadow-inner">
                    <Smartphone size={20} />
                </div>
                <div>
                    <p className="text-sm font-black text-foreground group-hover/item:text-primary transition-colors">{label}</p>
                    <p className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-tighter">ID: {id}</p>
                </div>
            </div>
            <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                status === 'Online' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            )}>
                <div className={cn("w-1 h-1 rounded-full", status === 'Online' ? "bg-emerald-500" : "bg-red-500")} />
                {status}
            </div>
        </div>
    );
}

