"use client";

import React from 'react';
import { Store, MapPin, User, ExternalLink, Activity, Plus, Smartphone, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const branches = [
    { id: 1, name: "Matriz Norte", address: "Av. Reforma 123", manager: "Sofia Casillas", status: "Online", tickets: 142, revenue: "$2,450" },
    { id: 2, name: "Sede Sur", address: "Plaza Las Américas #45", manager: "Pedro Sanchez", status: "Online", tickets: 89, revenue: "$1,840" },
    { id: 3, name: "Elite Este", address: "Col. Industrial G8", manager: "Lucía Mendez", status: "Offline", tickets: 124, revenue: "$3,120" },
    { id: 4, name: "Centro Histórico", address: "Calle Madero 10", manager: "Roberto Ruiz", status: "Online", tickets: 215, revenue: "$4,200" },
];

export default function BranchesPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <Store className="text-primary" size={28} />
                        </div>
                        Tus Sucursales
                    </h1>
                    <p className="text-muted-foreground text-sm">Control centralizado de todas tus sedes operativas en tiempo real.</p>
                </div>
                <button className="btn-primary py-3 px-6 flex items-center gap-2 group shadow-xl shadow-primary/20">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Nueva Sucursal</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {branches.map(branch => (
                    <div key={branch.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-secondary rounded-[1.25rem] flex items-center justify-center border border-border group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shadow-inner">
                                        <Store className="text-muted-foreground group-hover:text-primary transition-colors" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{branch.name}</h3>
                                        <div className={cn(
                                            "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 px-2 py-0.5 rounded-full border w-fit",
                                            branch.status === 'Online'
                                                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                                : "text-red-500 bg-red-500/10 border-red-500/20"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", branch.status === 'Online' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                            {branch.status}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2.5 bg-secondary hover:bg-card border border-border rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-95 shadow-sm">
                                    <ExternalLink size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 px-1">
                                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                    <MapPin size={14} className="text-primary/70" />
                                    <span>{branch.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                    <User size={14} className="text-primary/70" />
                                    <span>Encargado: {branch.manager}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border grid grid-cols-2 gap-6 relative">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                                        Tickets Mes
                                        <Activity size={10} className="text-primary/50" />
                                    </p>
                                    <p className="text-2xl font-black text-foreground">{branch.tickets}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 justify-end">
                                        Ingresos Hoy
                                        <Star size={10} className="text-amber-500/50" />
                                    </p>
                                    <p className="text-2xl font-black text-primary">{branch.revenue}</p>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-border hidden md:block" />
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 bg-secondary hover:bg-primary hover:text-white border border-border hover:border-primary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Ver Monitor
                                </button>
                                <button className="bg-secondary hover:bg-card border border-border px-4 py-2.5 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm">
                                    <Smartphone size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add Card */}
                <div className="border-4 border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="text-muted-foreground group-hover:text-primary" size={32} />
                    </div>
                    <h3 className="font-black text-foreground group-hover:text-primary transition-colors">Añadir Sucursal</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Expande tu negocio</p>
                </div>
            </div>
        </div>
    );
}

