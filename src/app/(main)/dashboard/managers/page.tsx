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
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <UserCog className="text-primary" size={28} />
                        </div>
                        Gestión de Encargados
                    </h1>
                    <p className="text-muted-foreground text-sm">Administra los accesos y roles de tu equipo operativo por sede.</p>
                </div>
                <button className="btn-primary py-3 px-6 flex items-center gap-2 group shadow-xl shadow-primary/20">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Añadir Encargado</span>
                </button>
            </div>

            <div className="glass-card p-1">
                <div className="p-8">
                    <div className="flex items-center gap-4 bg-secondary/50 px-5 py-3 rounded-2xl border border-border mb-8 max-w-md focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-inner">
                        <Search className="text-muted-foreground" size={18} />
                        <input
                            placeholder="Buscar por nombre o sucursal..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium text-foreground placeholder:text-muted-foreground/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {managers.map(manager => (
                            <div key={manager.id} className="glass-card group hover:scale-[1.01] transition-all duration-300">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-all text-primary group-hover:text-white shadow-inner font-black text-2xl">
                                                {manager.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{manager.name}</h3>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] mt-1 px-2 py-0.5 rounded-full border w-fit",
                                                    manager.status === 'Active'
                                                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                                        : "text-muted-foreground bg-secondary border-border"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", manager.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
                                                    {manager.status}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-3 px-1">
                                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            <Store size={14} className="text-primary/70" />
                                            <span className="truncate">Sucursal: <span className="text-foreground">{manager.branch}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            <Mail size={14} className="text-primary/70" />
                                            <span className="truncate">{manager.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            <Phone size={14} className="text-primary/70" />
                                            <span className="truncate">{manager.phone}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-primary/70" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Sucursal</span>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline group/more">
                                            Cargar Perfil
                                            <Activity size={12} className="group-hover/more:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Invite Card */}
                        <div className="border-4 border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="text-muted-foreground group-hover:text-primary" size={32} />
                            </div>
                            <h3 className="font-black text-foreground group-hover:text-primary transition-colors">Invitar Miembro</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Nuevos permisos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

