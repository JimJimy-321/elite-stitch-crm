"use client";

import React from 'react';
import { UserPlus, Shield, Store, Mail, Phone, MoreHorizontal, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const managers = [
    { id: 1, name: "Araceli Garcia", email: "ara@sastrepro.com", branch: "Matriz Norte", phone: "55 1234 5678", status: "Active" },
    { id: 2, name: "Jorge Luna", email: "jorge@sastrepro.com", branch: "Sede Sur", phone: "55 8765 4321", status: "Offline" },
    { id: 3, name: "Lucía Pineda", email: "lucia@sastrepro.com", branch: "Elite Este", phone: "55 1122 3344", status: "Active" },
];

export default function ManagersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Gestión de Encargados</h1>
                    <p className="text-muted text-sm mt-1">Crea y asigna personal operativo a tus sucursales.</p>
                </div>
                <button className="btn-primary group">
                    <UserPlus size={18} />
                    Nuevo Encargado
                </button>
            </div>

            <div className="glass-card p-6">
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-border mb-6 max-w-md focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                    <Search className="text-muted" size={18} />
                    <input placeholder="Buscar por nombre o sucursal..." className="bg-transparent border-none outline-none text-sm w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {managers.map(manager => (
                        <div key={manager.id} className="relative group overflow-hidden bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 hover:shadow-2xl hover:shadow-accent/5 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-muted hover:text-foreground">
                                    <MoreHorizontal />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-accent/20">
                                    {manager.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{manager.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            manager.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                                        )} />
                                        <span className="text-[10px] uppercase font-black tracking-widest text-muted">{manager.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                    <Store size={16} className="text-accent" />
                                    <span>Sucursal: <span className="text-foreground">{manager.branch}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                    <Mail size={16} />
                                    <span>{manager.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                    <Phone size={16} />
                                    <span>{manager.phone}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                <button className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                                    <Shield size={14} />
                                    Editar Permisos
                                </button>
                                <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted">
                                    <Plus className="rotate-45" size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
