"use client";

import React from 'react';
import { Ticket, Plus, Search, Filter, Sparkles, Activity, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function TicketsPage() {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Ticket className="text-orange-600" size={28} />
                        </div>
                        Tickets de Servicio
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Gestiona las órdenes, arreglos y entregas pendientes de todas tus sedes.</p>
                </div>
                <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Crear Ticket
                </button>
            </div>

            <div className="glass-card border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="p-10">
                    <div className="flex flex-col md:flex-row gap-6 mb-10">
                        <div className="flex-1 flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                            <Search className="text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por cliente, folio o prenda..."
                                className="bg-transparent border-none outline-none text-[15px] w-full font-bold text-foreground placeholder:text-slate-300"
                            />
                        </div>
                        <button className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl border border-slate-100 hover:bg-orange-50 hover:border-orange-500/20 transition-all font-black text-[11px] uppercase tracking-widest text-slate-600 shadow-sm group">
                            <Filter size={18} className="text-orange-500 group-hover:rotate-12 transition-transform" />
                            Filtros Avanzados
                        </button>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <MiniTicketStat label="Pendientes" value="12" color="text-amber-500" bg="bg-amber-50" />
                        <MiniTicketStat label="En Proceso" value="8" color="text-orange-500" bg="bg-orange-50" />
                        <MiniTicketStat label="Listos" value="24" color="text-emerald-500" bg="bg-emerald-50" />
                        <MiniTicketStat label="Entregados" value="156" color="text-slate-500" bg="bg-slate-50" />
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30 group hover:bg-orange-500/[0.02] hover:border-orange-500/20 transition-all duration-700">
                        <div className="relative mb-10">
                            <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                <Ticket size={56} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-xl animate-bounce border-4 border-white">
                                <Plus size={20} className="text-white" />
                            </div>
                        </div>

                        <div className="space-y-3 max-w-sm px-6">
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Tu mesa de trabajo está limpia</h3>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                No hay tickets activos en este momento. Registra un nuevo servicio para comenzar a trackear tus entregas con <span className="text-orange-600 font-bold underline decoration-orange-500/30 decoration-4">SastrePro Intelligence</span>.
                            </p>
                        </div>

                        <button className="mt-12 flex items-center gap-3 px-10 py-4 bg-foreground text-background rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-foreground/20 group/btn">
                            <Sparkles size={18} className="text-orange-500 animate-pulse" />
                            Registrar Primer Ticket
                            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniTicketStat({ label, value, color, bg }: { label: string, value: string, color: string, bg: string }) {
    return (
        <div className={cn(
            "p-6 rounded-[1.75rem] border border-slate-100 text-center transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 group",
            bg
        )}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
            <p className={cn("text-3xl font-black tracking-tighter", color)}>{value}</p>
        </div>
    );
}
