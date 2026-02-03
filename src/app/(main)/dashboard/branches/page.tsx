"use client";

import React from 'react';
import { Store, MapPin, User, ExternalLink, Activity, Plus, Smartphone, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useBranches } from '@/features/dashboard/hooks/useDashboardData';

export default function BranchesPage() {
    const { branches, loading } = useBranches();

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Store className="text-orange-600" size={28} />
                        </div>
                        Tus Sucursales
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Control centralizado de todas tus sedes operativas en tiempo real.</p>
                </div>
                <button className="bg-orange-500 text-white py-4 px-8 flex items-center gap-3 group shadow-2xl shadow-orange-500/30 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Nueva Sucursal</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-16 h-16 bg-slate-100 rounded-full mb-4"></div>
                        <div className="h-4 w-48 bg-slate-100 rounded"></div>
                    </div>
                ) : branches.length > 0 ? (
                    branches.map(branch => (
                        <div key={branch.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 border-none shadow-2xl bg-card overflow-hidden border-t-4 border-t-orange-500 rounded-[2rem]">
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center border border-orange-200 group-hover:border-orange-300 transition-all shadow-inner">
                                            <Store className="text-slate-400 group-hover:text-orange-500 transition-colors" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">{branch.name}</h3>
                                            <div className={cn(
                                                "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2.5 py-1 rounded-full border w-fit shadow-sm",
                                                branch.metadata?.online !== false
                                                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                    : "text-red-500 bg-red-50 border-red-100"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", branch.metadata?.online !== false ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                                {branch.metadata?.online !== false ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-500 transition-all active:scale-95 shadow-sm">
                                        <ExternalLink size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4 px-1">
                                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                        <MapPin size={16} className="text-orange-500/70" />
                                        <span>{branch.address || 'Ubicación no registrada'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                        <User size={16} className="text-orange-500/70" />
                                        <span>Encargado: <span className="text-foreground">{branch.metadata?.manager || 'Sin asignar'}</span></span>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-8 relative">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={12} className="text-orange-500/50" />
                                            Actividad
                                        </p>
                                        <p className="text-3xl font-black text-foreground tracking-tighter">Normal</p>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 justify-end">
                                            Sucursal ID
                                            <Star size={12} className="text-orange-500/50" />
                                        </p>
                                        <p className="text-3xl font-black text-orange-600 tracking-tighter uppercase">{branch.id.split('-')[0]}</p>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-10 bg-slate-100 hidden md:block" />
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 bg-orange-100 hover:bg-orange-500 text-orange-800 hover:text-white border border-orange-200 hover:border-orange-500 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                                        Ver Monitor Detallado
                                    </button>
                                    <button className="bg-orange-100 hover:bg-orange-200 border border-orange-200 px-5 py-4 rounded-2xl text-orange-700 hover:text-orange-600 transition-all shadow-sm">
                                        <Smartphone size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-20 bg-slate-50/50">
                        <Store className="text-slate-300 mb-6" size={60} />
                        <h3 className="text-2xl font-black text-foreground tracking-tight">No hay sucursales registradas</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-2">Comienza añadiendo tu primera sede operativa.</p>
                    </div>
                )}

                {/* Add Card */}
                <div className="border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-orange-500/30 hover:bg-orange-500/5 transition-all cursor-pointer bg-slate-50/50">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl border border-slate-100">
                        <Plus className="text-slate-400 group-hover:text-orange-500" size={40} />
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">Añadir Sucursal</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">Expande tu imperio SastrePro</p>
                </div>
            </div>
        </div>
    );
}

