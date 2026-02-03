"use client";

import React from 'react';
import { Ticket, Plus, Search, Filter, Sparkles, Activity, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function TicketsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <Ticket className="text-primary" size={28} />
                        </div>
                        Tickets de Servicio
                    </h1>
                    <p className="text-muted-foreground text-sm">Gestiona las órdenes, arreglos y entregas pendientes de todas tus sedes.</p>
                </div>
                <button className="btn-primary py-3 px-6 flex items-center gap-2 group shadow-xl shadow-primary/20">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Crear Ticket</span>
                </button>
            </div>

            <div className="glass-card p-1">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 flex items-center gap-4 bg-secondary/50 px-5 py-3 rounded-2xl border border-border focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-inner">
                            <Search className="text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por cliente, folio o prenda..."
                                className="bg-transparent border-none outline-none text-sm w-full font-medium text-foreground placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <button className="flex items-center gap-3 px-6 py-3 bg-card rounded-2xl border border-border hover:bg-secondary transition-all font-black text-[10px] uppercase tracking-widest text-foreground shadow-sm group">
                            <Filter size={16} className="text-primary group-hover:rotate-12 transition-transform" />
                            Filtros Avanzados
                        </button>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        <MiniTicketStat label="Pendientes" value="12" color="text-amber-500" />
                        <MiniTicketStat label="En Proceso" value="8" color="text-primary" />
                        <MiniTicketStat label="Listos" value="24" color="text-emerald-500" />
                        <MiniTicketStat label="Entregados" value="156" color="text-muted-foreground" />
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/10 group hover:bg-primary/5 hover:border-primary/20 transition-all duration-500">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-card rounded-[2rem] flex items-center justify-center border-2 border-border shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Ticket size={48} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce border-4 border-background">
                                <Plus size={16} className="text-white" />
                            </div>
                        </div>

                        <div className="space-y-2 max-w-sm">
                            <h3 className="text-xl font-black text-foreground tracking-tight">Tu mesa de trabajo está limpia</h3>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                No hay tickets activos en este momento. Registra un nuevo servicio para comenzar a trackear tus entregas.
                            </p>
                        </div>

                        <button className="mt-8 flex items-center gap-2 px-8 py-3.5 bg-foreground text-background rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10 group/btn">
                            <Sparkles size={16} className="animate-pulse" />
                            Registrar Primer Ticket
                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniTicketStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="p-4 bg-secondary/30 rounded-2xl border border-border text-center group hover:bg-card transition-all">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className={cn("text-xl font-black", color)}>{value}</p>
        </div>
    );
}

