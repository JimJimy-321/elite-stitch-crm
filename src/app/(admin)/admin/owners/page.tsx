"use client";

import React, { useState } from 'react';
import { Users, Mail, CreditCard, Store, Search, Filter, MoreVertical, Plus, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Modal } from '@/shared/components/ui/Modal';

const INITIAL_OWNERS = [
    { id: 1, name: "Juan Ibarra", email: "juan@elite.com", plan: "Anual Pro", status: "Active", branches: 4, expiry: "2027-01-20" },
    { id: 2, name: "Maria Garcia", email: "maria@sastre.com", plan: "Mensual", status: "Active", branches: 1, expiry: "2026-03-05" },
    { id: 3, name: "Roberto Soto", email: "roberto@textil.mx", plan: "Trial", status: "Expiring", branches: 2, expiry: "2026-02-15" },
    { id: 4, name: "Sastrería Lopez", email: "ventas@lopez.com", plan: "Enterprise", status: "Active", branches: 12, expiry: "2028-11-10" },
];

export default function AdminOwnersPage() {
    const [ownersList, setOwnersList] = useState(INITIAL_OWNERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddOwner = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const newOwner = {
            id: ownersList.length + 1,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            plan: formData.get('plan') as string,
            status: "Active",
            branches: parseInt(formData.get('branches') as string) || 1,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        setTimeout(() => {
            setOwnersList([newOwner, ...ownersList]);
            setIsSubmitting(false);
            setIsModalOpen(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Building2 className="text-orange-600" size={28} />
                        </div>
                        Gestión de Dueños
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Monitorea y administra la base de clientes SaaS SastrePro.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 text-white py-4 px-8 flex items-center gap-3 group shadow-2xl shadow-orange-500/30 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Registrar Nuevo Dueño</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DashboardStatCard label="Total Dueños" value={ownersList.length.toString()} borderColor="border-l-orange-500" />
                <DashboardStatCard label="Ingresos MRR" value="$14,820" borderColor="border-l-indigo-500" />
                <DashboardStatCard label="En Riesgo" value="8" borderColor="border-l-amber-500" />
                <DashboardStatCard label="Nuevos (Mes)" value="+12" borderColor="border-l-emerald-500" />
            </div>

            <div className="glass-card border-none shadow-2xl bg-card overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-center justify-between bg-card">
                    <div className="flex items-center gap-4 bg-orange-50 px-5 py-3.5 rounded-[1.25rem] border border-orange-200 flex-1 max-w-md focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                        <Search className="text-slate-400" size={18} />
                        <input
                            placeholder="Buscar por nombre, email o empresa..."
                            className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/30 font-bold"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3.5 bg-orange-100 rounded-xl border border-orange-200 text-orange-700 hover:text-orange-600 hover:bg-orange-200 transition-all shadow-sm">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-orange-50/30 text-[10px] font-black uppercase tracking-[0.2em] text-orange-800 border-b border-orange-100">
                                <th className="px-8 py-5">Cliente / Organization</th>
                                <th className="px-8 py-5">Membresía</th>
                                <th className="px-8 py-5">Sucursales</th>
                                <th className="px-8 py-5">Vigencia</th>
                                <th className="px-8 py-5">Estatus</th>
                                <th className="px-8 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ownersList.map((owner) => (
                                <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-orange-600 shadow-xl group-hover:scale-110 transition-transform">
                                                {owner.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-[13px] text-foreground tracking-tight">{owner.name}</p>
                                                <p className="text-[11px] text-muted-foreground font-bold">{owner.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black uppercase flex items-center gap-2 shadow-sm border border-orange-100">
                                                <CreditCard size={12} />
                                                {owner.plan}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-[13px] font-black text-foreground">
                                        <div className="flex items-center gap-2">
                                            <Store size={16} className="text-orange-500/50" />
                                            {owner.branches} Sedes
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-[11px] font-black text-slate-400 tracking-tighter">
                                        {owner.expiry}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm",
                                            owner.status === 'Active'
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                : "bg-amber-50 text-amber-600 border border-amber-100"
                                        )}>
                                            {owner.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-300 hover:text-orange-500 transition-all hover:bg-orange-50 rounded-lg">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registrar Dueño Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nuevo Dueño SaaS"
            >
                <form onSubmit={handleAddOwner} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input name="name" required className="input-field pl-10" placeholder="Ej: Roberto Gomez" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Corporativo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input name="email" type="email" required className="input-field pl-10" placeholder="roberto@empresa.com" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Plan SaaS</label>
                            <select name="plan" className="input-field">
                                <option value="Mensual">Plan Mensual</option>
                                <option value="Anual Pro">Anual Pro (Recomendado)</option>
                                <option value="Enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sucursales Permitidas</label>
                            <input name="branches" type="number" min="1" defaultValue="1" className="input-field" />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary py-3 relative overflow-hidden"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Aprovisionando Tenant...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} />
                                    Activar Cuenta Pro
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function DashboardStatCard({ label, value, borderColor }: { label: string; value: string; borderColor: string }) {
    return (
        <div className={cn(
            "glass-card p-8 border-none shadow-xl bg-card border-l-4 transition-all hover:scale-[1.02] duration-300",
            borderColor
        )}>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">{label}</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
        </div>
    );
}

