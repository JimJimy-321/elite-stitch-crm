"use client";

import React from 'react';
import { MessageSquare, ShieldCheck, Key, Smartphone, Plus, Settings } from 'lucide-react';

export default function AdminWhatsAppPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl text-white">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <MessageSquare className="text-accent" />
                    Configuración Core WhatsApp API
                </h1>
                <p className="text-slate-400 text-sm">Gestiona los tokens de acceso y Phone IDs globales para SastrePro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card bg-slate-900 border-white/5 p-8 space-y-6">
                    <h3 className="font-bold text-lg border-b border-white/5 pb-4 flex items-center justify-between">
                        Meta Developer Credentials
                        <ShieldCheck className="text-emerald-500" size={18} />
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Access Token</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="password" value="EAAGm0PZC6ZCs0BAO6..." readOnly className="w-full bg-slate-950 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs font-mono outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Management ID</label>
                            <input type="text" value="342958012932" readOnly className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono outline-none text-slate-400" />
                        </div>
                    </div>

                    <button className="w-full py-3 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                        Actualizar Claves Globales
                    </button>
                </div>

                <div className="glass-card bg-slate-900 border-white/5 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Teléfonos Activos</h3>
                        <button className="p-2 bg-accent/20 rounded-lg text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all">
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <PhoneItem label="SastrePro Matriz" id="102938475" status="Online" />
                        <PhoneItem label="SastrePro Sede Sur" id="192837465" status="Online" />
                        <PhoneItem label="SastrePro Demo" id="000000000" status="Disconnected" />
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20 flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
                    <Settings size={24} />
                </div>
                <div>
                    <p className="text-sm font-bold text-amber-200">Webhook Management</p>
                    <p className="text-xs text-slate-400">El servidor actualmente está recibiendo eventos en: <span className="text-amber-500 font-mono">https://api.sastrepro.com/wh/v1</span></p>
                </div>
            </div>
        </div>
    );
}

function PhoneItem({ label, id, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-950 border border-white/5 rounded-xl">
            <div className="flex items-center gap-3">
                <Smartphone className="text-slate-500" size={18} />
                <div>
                    <p className="text-sm font-bold">{label}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {id}</p>
                </div>
            </div>
            <span className={cn(
                "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                status === 'Online' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
            )}>
                {status}
            </span>
        </div>
    );
}
