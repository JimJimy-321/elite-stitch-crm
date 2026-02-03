"use client";

import React from 'react';
import { Users, UserPlus, Search } from 'lucide-react';

export default function ClientsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Users className="text-orange-600" size={28} />
                        </div>
                        Directorio de Clientes
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Base de datos centralizada de clientes y sus medidas personalizadas.</p>
                </div>
                <button className="bg-orange-500 text-white py-4 px-8 flex items-center gap-3 group shadow-2xl shadow-orange-500/30 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all">
                    <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Registrar Cliente</span>
                </button>
            </div>

            <div className="glass-card p-1 border-none shadow-2xl bg-card overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                        <Search className="text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o email..."
                            className="bg-transparent border-none outline-none text-sm w-full font-bold text-foreground placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                    <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-orange-100 shadow-inner group hover:scale-110 transition-transform duration-500">
                        <Users size={48} className="text-orange-500 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">Tu lista de clientes está vacía</h3>
                    <p className="text-muted-foreground text-sm font-medium max-w-sm mt-3 leading-relaxed">
                        Los clientes registrados aquí podrán recibir actualizaciones de sus pedidos vía <span className="text-orange-600 font-bold underline decoration-orange-500/30 decoration-4">WhatsApp automáticamente</span>.
                    </p>
                    <button className="mt-10 px-8 py-3 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-orange-600 hover:border-orange-500/30 hover:bg-orange-50 rounded-xl transition-all shadow-sm">
                        Importar desde Excel
                    </button>
                </div>
            </div>
        </div>
    );
}
