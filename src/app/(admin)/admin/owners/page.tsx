"use client";

import React from 'react';
import { Users, Mail, CreditCard, Store, Search, Filter, MoreVertical, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const owners = [
    { id: 1, name: "Juan Ibarra", email: "juan@elite.com", plan: "Anual Pro", status: "Active", branches: 4, expiry: "2027-01-20" },
    { id: 2, name: "Maria Garcia", email: "maria@sastre.com", plan: "Mensual", status: "Active", branches: 1, expiry: "2026-03-05" },
    { id: 3, name: "Roberto Soto", email: "roberto@textil.mx", plan: "Trial", status: "Expiring", branches: 2, expiry: "2026-02-15" },
    { id: 4, name: "Sastrería Lopez", email: "ventas@lopez.com", plan: "Enterprise", status: "Active", branches: 12, expiry: "2028-11-10" },
];

export default function AdminOwnersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Gestión de Dueños</h1>
                    <p className="text-muted text-sm mt-1">Monitorea y administra la base de clientes SaaS.</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    Registrar Nuevo Dueño
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Dueños" value="156" color="accent" />
                <StatCard label="Ingresos MRR" value="$12,450" color="emerald" />
                <StatCard label="En Riesgo" value="8" color="amber" />
                <StatCard label="Nuevos (Mes)" value="+12" color="cyan" />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-border flex-1 max-w-md">
                        <Search className="text-muted" size={18} />
                        <input placeholder="Buscar por nombre, email o empresa..." className="bg-transparent border-none outline-none text-sm w-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-secondary rounded-xl border border-border text-muted hover:text-foreground">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary/30 text-[10px] font-black uppercase tracking-widest text-muted">
                                <th className="px-6 py-4">Cliente / Organization</th>
                                <th className="px-6 py-4">Membresía</th>
                                <th className="px-6 py-4">Sucursales</th>
                                <th className="px-6 py-4">Vigencia</th>
                                <th className="px-6 py-4">Estatus</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {owners.map((owner) => (
                                <tr key={owner.id} className="hover:bg-accent/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent">
                                                {owner.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{owner.name}</p>
                                                <p className="text-xs text-muted font-medium">{owner.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className="text-muted" />
                                            <span className="text-sm font-semibold">{owner.plan}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold">
                                        <div className="flex items-center gap-2">
                                            <Store size={14} className="text-muted" />
                                            {owner.branches}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-muted">
                                        {owner.expiry}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                            owner.status === 'Active' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                        )}>
                                            {owner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-muted hover:text-accent transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: any) {
    return (
        <div className="glass-card p-6 border-b-4 border-b-accent">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
}
