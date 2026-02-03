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
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <MessageSquare className="text-orange-600" size={28} />
                        </div>
                        Configuración Core WhatsApp API
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Gestión centralizada de tokens de acceso, Webhooks y Phone IDs globales.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Gateway Master Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Credentials Card */}
                <div className="glass-card bg-card border-none shadow-2xl overflow-hidden group">
                    <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-orange-500/[0.03] to-transparent">
                        <h3 className="font-black text-foreground flex items-center justify-between uppercase text-[11px] tracking-[0.25em]">
                            Meta Developer Credentials
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <ShieldCheck className="text-orange-600" size={18} />
                            </div>
                        </h3>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Global Access Token</label>
                            <div className="relative group/token">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/token:text-orange-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value="EAAGm0PZC6ZCs0BAO6D..."
                                    readOnly
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-12 py-5 text-sm font-bold font-mono outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all shadow-inner"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500 p-2 hover:bg-white rounded-xl transition-all shadow-sm">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Business Management ID</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    value="342958012932"
                                    readOnly
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 py-5 text-sm font-black font-mono outline-none text-foreground/80 shadow-inner"
                                />
                            </div>
                        </div>

                        <button className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 active:scale-95 transition-all shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3">
                            <Zap size={18} />
                            Actualizar Claves Maestras
                        </button>
                    </div>
                </div>

                {/* Phones Card */}
                <div className="glass-card bg-card border-none shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.25em]">Dispositivos Activos</h3>
                        <button className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-90">
                            <Plus size={24} />
                        </button>
                    </div>

                    <div className="p-6 flex-1 space-y-3">
                        <PhoneItem label="SastrePro Matriz" id="102938475" status="Online" />
                        <PhoneItem label="SastrePro Sede Sur" id="192837465" status="Online" />
                        <PhoneItem label="SastrePro Demo" id="000000000" status="Disconnected" />
                    </div>

                    <div className="p-8 border-t border-slate-50">
                        <button className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all flex items-center justify-center gap-3 border border-dashed border-slate-200 hover:border-orange-500/30">
                            Documentación Técnica API
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Webhook Monitor */}
            <div className="glass-card p-1 border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden group">
                <div className="p-10 flex flex-col md:flex-row items-center gap-10 bg-card rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-orange-50 rounded-[2rem] text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform shadow-inner">
                        <Settings size={36} className="group-hover:rotate-90 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <p className="text-xl font-black text-foreground tracking-tight">Webhook Gateway Listener</p>
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        </div>
                        <p className="text-sm text-muted-foreground font-bold leading-relaxed max-w-2xl">
                            Endpoint actual del listener global de SastrePro SaaS para todos los eventos de entrada de la API oficial de Meta.
                        </p>
                        <div className="mt-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-fit inline-block font-mono text-xs font-black text-orange-600 shadow-sm">
                            https://api.sastrepro.com/wh/v1
                        </div>
                    </div>
                    <button className="px-10 py-5 bg-foreground text-background rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-foreground/20">
                        Test Webhook Sync
                    </button>
                </div>
            </div>
        </div>
    );
}

function PhoneItem({ label, id, status }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[1.75rem] hover:bg-white hover:border-orange-500/30 hover:shadow-xl transition-all group/item cursor-default">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:text-orange-600 group-hover/item:border-orange-200 transition-all shadow-sm group-hover/item:shadow-lg">
                    <Smartphone size={24} />
                </div>
                <div>
                    <p className="text-[15px] font-black text-foreground group-hover/item:text-orange-600 transition-colors tracking-tight">{label}</p>
                    <p className="text-[10px] text-muted-foreground font-bold font-mono tracking-tighter uppercase mt-0.5">Device ID: {id}</p>
                </div>
            </div>
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-[0.15em] shadow-sm",
                status === 'Online' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
            )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", status === 'Online' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                {status}
            </div>
        </div>
    );
}

