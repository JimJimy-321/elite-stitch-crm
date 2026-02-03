"use client";

import React from 'react';
import { Users, UserPlus, Search, Phone, Mail, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { useClients } from '@/features/dashboard/hooks/useDashboardData';
import { cn } from '@/shared/lib/utils';

export default function ClientsPage() {
    const { clients, loading } = useClients();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Users className="text-orange-600" size={28} />
                        </div>
                        Directorio de Clientes
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Base de datos centralizada de clientes y sus medidas personalizadas.</p>
                </div>
                <button className="bg-orange-500 text-white py-4 px-8 flex items-center gap-3 group shadow-2xl shadow-orange-500/30 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all">
                    <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Registrar Cliente</span>
                </button>
            </div>

            <div className="glass-card border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem]">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                        <Search className="text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o email..."
                            className="bg-transparent border-none outline-none text-sm w-full font-bold text-foreground placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-16 h-16 bg-slate-100 rounded-full mb-4"></div>
                        <div className="h-4 w-48 bg-slate-100 rounded"></div>
                    </div>
                ) : clients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Contacto</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {clients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-orange-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                                                    {client.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 leading-tight">{client.full_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registrado el {new Date(client.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <Phone size={14} className="text-orange-500" />
                                                    {client.phone}
                                                </div>
                                                {client.email && (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                        <Mail size={14} />
                                                        {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {client.preferences?.vip ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                    <ShieldCheck size={14} />
                                                    Club VIP
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                    Regular
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-50 transition-all shadow-sm">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                        <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-orange-100 shadow-inner group hover:scale-110 transition-transform duration-500">
                            <Users size={48} className="text-orange-500 group-hover:animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Tu lista de clientes está vacía</h3>
                        <p className="text-muted-foreground text-sm font-medium max-w-sm mt-3 leading-relaxed">
                            Los clientes registrados aquí podrán recibir actualizaciones de sus pedidos vía <span className="text-orange-600 font-bold underline decoration-orange-500/30 decoration-4">WhatsApp automáticamente</span>.
                        </p>
                        <button className="mt-10 px-8 py-3 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-orange-600 hover:border-orange-500/30 hover:bg-orange-50 rounded-xl transition-all shadow-sm">
                            Importar desde Excel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
