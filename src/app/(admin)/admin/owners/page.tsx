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
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Gestión de Dueños</h1>
                    <p className="text-muted text-sm mt-1">Monitorea y administra la base de clientes SaaS.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Registrar Nuevo Dueño
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Dueños" value={ownersList.length.toString()} color="accent" />
                <StatCard label="Ingresos MRR" value="$14,820" color="emerald" />
                <StatCard label="En Riesgo" value="8" color="amber" />
                <StatCard label="Nuevos (Mes)" value="+12" color="cyan" />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 backdrop-blur-md">
                    <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2.5 rounded-xl border border-border flex-1 max-w-md focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <Search className="text-muted-foreground" size={18} />
                        <input
                            placeholder="Buscar por nombre, email o empresa..."
                            className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-secondary rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="px-6 py-4">Cliente / Organization</th>
                                <th className="px-6 py-4">Membresía</th>
                                <th className="px-6 py-4">Sucursales</th>
                                <th className="px-6 py-4">Vigencia</th>
                                <th className="px-6 py-4">Estatus</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {ownersList.map((owner) => (
                                <tr key={owner.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                                {owner.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{owner.name}</p>
                                                <p className="text-xs text-muted-foreground font-medium">{owner.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-foreground">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 px-2 rounded-lg bg-secondary text-[10px] font-bold uppercase flex items-center gap-1.5">
                                                <CreditCard size={10} className="text-primary" />
                                                {owner.plan}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                                        <div className="flex items-center gap-2">
                                            <Store size={14} className="text-muted-foreground" />
                                            {owner.branches}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                        {owner.expiry}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                            owner.status === 'Active' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                        )}>
                                            {owner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
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

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="glass-card p-6 border-b-4 border-b-primary hover:translate-y-[-4px] transition-transform">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-foreground">{value}</p>
        </div>
    );
}

