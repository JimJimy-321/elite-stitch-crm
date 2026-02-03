"use client";

import React from 'react';
import { UserPlus, Shield, Store, Mail, Phone, MoreHorizontal, Search, Plus, UserCog, MoreVertical, Activity } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const managers = [
    { id: 1, name: "Araceli Garcia", email: "ara@sastrepro.com", branch: "Matriz Norte", phone: "55 1234 5678", status: "Active" },
    { id: 2, name: "Jorge Luna", email: "jorge@sastrepro.com", branch: "Sede Sur", phone: "55 8765 4321", status: "Offline" },
    { id: 3, name: "Lucía Pineda", email: "lucia@sastrepro.com", branch: "Elite Este", phone: "55 1122 3344", status: "Active" },
];

export default function ManagersPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <UserCog className="text-orange-600" size={28} />
                        </div>
                        Gestión de Equipo
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Administra los accesos y roles de tu equipo operativo por sede.</p>
                </div>
                <button className="bg-orange-500 text-white py-4 px-8 flex items-center gap-3 group shadow-2xl shadow-orange-500/30 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Añadir Encargado</span>
                </button>
            </div>

            <div className="glass-card border-none shadow-2xl bg-card">
                <div className="p-8">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-10 max-w-md focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                        <Search className="text-slate-400" size={18} />
                        <input
                            placeholder="Buscar por nombre o sucursal..."
                            className="bg-transparent border-none outline-none text-sm w-full font-bold text-foreground placeholder:text-muted-foreground/30"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {managers.map(manager => (
                            <div key={manager.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 border-none shadow-xl bg-slate-50/50 hover:bg-white border-l-4 border-l-orange-500">
                                <div className="p-8 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-orange-500 transition-all text-orange-600 group-hover:text-white shadow-xl font-black text-2xl tracking-tighter">
                                                {manager.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">{manager.name}</h3>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2.5 py-1 rounded-full border w-fit shadow-sm",
                                                    manager.status === 'Active'
                                                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                        : "text-slate-500 bg-slate-100 border-slate-200"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", manager.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                                                    {manager.status}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 px-1">
                                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                            <Store size={16} className="text-orange-500/70" />
                                            <span className="truncate">Sucursal: <span className="text-foreground">{manager.branch}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                            <Mail size={16} className="text-orange-500/70" />
                                            <span className="truncate">{manager.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                            <Phone size={16} className="text-orange-500/70" />
                                            <span className="truncate">{manager.phone}</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-inner">
                                            <Shield size={14} className="text-orange-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border-none">Admin Sede</span>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 hover:underline group/more transition-all">
                                            Gestionar
                                            <Activity size={12} className="group-hover/more:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Invite Card */}
                        <div className="border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-orange-500/30 hover:bg-orange-500/5 transition-all cursor-pointer bg-slate-50/50">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                                <Plus className="text-slate-400 group-hover:text-orange-500" size={40} />
                            </div>
                            <h3 className="text-xl font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">Invitar Miembro</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">Nuevos permisos IA</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

