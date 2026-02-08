"use client";

import React, { useState } from 'react';
import {
    Ticket,
    Users,
    TrendingUp,
    Clock,
    Package,
    AlertTriangle,
    Search,
    ChevronRight,
    Calendar,
    ArrowUpRight,
    Scissors,
    History,
    CheckCircle2,
    Plus,
    Activity
} from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { useNotas, useAdvancedNotas, useDashboardStats, useDailyFinancials, useActiveWorkQueue } from '../hooks/useDashboardData';
import { NotaDetailView } from './nota-details/NotaDetailView';
import { AdvancedNotaForm } from './AdvancedNotaForm';
import { Modal } from '@/shared/components/ui/Modal';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface Props {
    user?: any;
}

export function ManagerDashboard({ user: initialUser }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isNewNotaModalOpen, setIsNewNotaModalOpen] = useState(false);
    const [selectedNota, setSelectedNota] = useState<any>(null);
    const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats(initialUser?.assigned_branch_id);
    const { financials, loading: finLoading, refetch: refetchFin } = useDailyFinancials(initialUser?.assigned_branch_id);
    const { queue: activeQueue, loading: queueLoading, refetch: refetchQueue } = useActiveWorkQueue(initialUser?.assigned_branch_id);

    const { notas, loading: notasLoading, refetch } = useNotas(debouncedSearch);

    const isLoading = notasLoading || statsLoading || finLoading || queueLoading;

    // Lógica de Prioridades
    const today = new Date().toISOString().split('T')[0];
    const urgentNotas = notas.filter(t =>
        t.status !== 'delivered' &&
        (t.delivery_date === today || t.items?.some((i: any) => i.priority === 'express'))
    ).slice(0, 10);
    const overdueNotas = notas.filter(t => t.status !== 'delivered' && t.delivery_date < today).slice(0, 5);
    const abandonedNotas = notas.filter(t => {
        const lastUpdate = new Date(t.updated_at);
        const diffDays = Math.ceil((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
        return t.status === 'ready' && diffDays >= 30;
    });

    // KPI Calc
    // const totalVenta = notas.reduce((acc, t) => acc + (t.total_amount || 0), 0);


    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
                        Centro de Control <span className="text-orange-500">Operativo</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">SastrePro Intelligence v3.0</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 w-full md:w-96 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                        <Search className="text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar notas o clientes..."
                            className="bg-transparent border-none outline-none text-sm font-bold w-full uppercase placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        />
                    </div>
                    <button
                        onClick={() => setIsNewNotaModalOpen(true)}
                        className="bg-orange-500 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {/* Dashboard Speed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Recibidos Hoy" value={stats?.received || "0"} icon={Package} color="orange" border="border-orange-500" />
                <KPICard title="Por Entregar" value={overdueNotas.length.toString()} icon={Clock} color="blue" border="border-blue-500" />
                <KPICard title="Abandonados (30d+)" value={abandonedNotas.length.toString()} icon={AlertTriangle} color="purple" border="border-purple-500" />
                <KPICard title="Ingresos Hoy" value={formatCurrency(financials?.income || 0)} icon={TrendingUp} color="emerald" border="!border-orange-500 border-2" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                {/* Main Queue */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <Activity size={16} className="text-orange-500" /> Cola de Trabajo Activa
                        </h2>
                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{activeQueue.length} Órdenes</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array(8).fill(0).map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-[1.5rem] animate-pulse" />)
                        ) : notas.length > 0 ? (
                            notas.slice(0, 12).map((t: any) => (
                                <QuickNotaCard
                                    key={t.id}
                                    nota={t}
                                    onClick={() => {
                                        setSelectedNota(t);
                                        setIsDetailModalOpen(true);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                <Package className="mx-auto text-slate-200 mb-4" size={48} />
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">No hay notas activas</p>
                            </div>
                        )}
                    </div>

                    <button className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-orange-600 transition-all group flex items-center justify-center gap-3">
                        Ver todas las notas <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Sidebar Priority */}
                <div className="space-y-8">
                    {/* Urgentes */}
                    <div className="glass-card p-8 border-none shadow-2xl bg-white rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em] mb-6 flex items-center gap-3">
                            Express / Hoy
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        </h3>
                        <div className="space-y-4">
                            {urgentNotas.length > 0 ? urgentNotas.map((t: any) => (
                                <div key={t.id} onClick={() => { setSelectedNota(t); setIsDetailModalOpen(true); }} className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-orange-600 uppercase">NOTA {t.ticket_number}</span>
                                        <History size={14} className="text-orange-400" />
                                    </div>
                                    <p className="text-xs font-black text-slate-800 truncate uppercase">{t.client?.full_name}</p>
                                    <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-tight">
                                        {t.items?.some((i: any) => i.priority === 'express') ? 'SERVICIO EXPRESS' : 'PARA HOY'}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-center py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin servicios express hoy</p>
                            )}
                        </div>
                    </div>

                    {/* Retrasados */}
                    {overdueNotas.length > 0 && (
                        <div className="glass-card p-8 border-none shadow-2xl bg-rose-50 rounded-[2.5rem]">
                            <h3 className="font-black text-rose-600 uppercase text-[11px] tracking-[0.2em] mb-6">Retrasados / Vencidos</h3>
                            <div className="space-y-4">
                                {overdueNotas.map((t: any) => (
                                    <div key={t.id} onClick={() => { setSelectedNota(t); setIsDetailModalOpen(true); }} className="p-4 bg-white/80 border border-rose-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black text-rose-600 uppercase">NOTA {t.ticket_number}</span>
                                            <AlertTriangle size={14} className="text-rose-400" />
                                        </div>
                                        <p className="text-xs font-black text-slate-800 truncate uppercase">{t.client?.full_name}</p>
                                        <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">FECHA VENCIDA</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedNota(null); }}
                title={`Detalles - Nota ${selectedNota?.ticket_number}`}
                className="max-w-7xl"
            >
                {selectedNota && (
                    <NotaDetailView
                        nota={selectedNota}
                        onUpdate={async () => {
                            const newNotas = await refetch();
                            await refetchStats();
                            if (selectedNota) {
                                const updated = newNotas.find((t: any) => t.id === selectedNota.id);
                                if (updated) setSelectedNota(updated);
                            }
                        }}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isNewNotaModalOpen}
                onClose={() => setIsNewNotaModalOpen(false)}
                title="Nueva Nota de Servicio"
                className="max-w-7xl"
            >
                <AdvancedNotaForm
                    onClose={() => setIsNewNotaModalOpen(false)}
                    onSuccess={async () => {
                        setIsNewNotaModalOpen(false);
                        await refetch();
                        await refetchStats();
                        await refetchFin();
                        await refetchQueue();
                    }}
                />
            </Modal>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, border }: any) {
    const colorClasses: Record<string, string> = {
        orange: "bg-orange-50 text-orange-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        emerald: "bg-emerald-50 text-emerald-600"
    };

    return (
        <div className={cn("glass-card p-8 bg-white border-2 border-orange-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all hover:scale-[1.02]", border)}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-4 rounded-2xl", colorClasses[color])}>
                    <Icon size={24} />
                </div>
                <ArrowUpRight className="text-slate-200" size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
    );
}

function QuickNotaCard({ nota, onClick }: { nota: any, onClick: () => void }) {
    const statusMap: Record<string, { label: string, color: string, bg: string }> = {
        received: { label: 'Recibido', color: 'text-amber-600', bg: 'bg-amber-100' },
        processing: { label: 'En Proceso', color: 'text-orange-600', bg: 'bg-orange-100' },
        ready: { label: 'Listo', color: 'text-emerald-600', bg: 'bg-emerald-100' },
        delivered: { label: 'Entregado', color: 'text-slate-600', bg: 'bg-slate-100' }
    };
    const status = statusMap[nota.status] || statusMap.received;

    return (
        <div onClick={onClick} className="p-4 bg-white border-2 border-orange-50 rounded-[1.5rem] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group cursor-pointer relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-widest mb-1 shadow-sm block w-fit">NOTA {nota.ticket_number}</span>
                    <h4 className="font-black text-[13px] text-slate-800 truncate max-w-[110px] tracking-tight uppercase">{nota.client?.full_name}</h4>
                </div>
                <div className={cn("px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-sm", status.bg, status.color)}>
                    {status.label}
                </div>
            </div>

            {nota.items?.some((i: any) => i.priority === 'express') && (
                <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white text-[6px] font-black px-3 py-0.5 rotate-45 translate-x-3 -translate-y-1 shadow-lg uppercase tracking-widest">
                        Express
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                        {nota.items?.slice(0, 2).map((item: any, i: number) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                {item.garment_name?.[0] || 'P'}
                            </div>
                        ))}
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{nota.items?.length || 0} pzs</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar size={10} className="text-orange-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">{new Date(nota.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                </div>
            </div>

            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-300 uppercase">Saldo</span>
                <span className={cn("text-[11px] font-black", nota.balance_due > 0 ? "text-amber-500" : "text-emerald-500")}>
                    {formatCurrency(nota.balance_due)}
                </span>
            </div>
        </div>
    );
}
