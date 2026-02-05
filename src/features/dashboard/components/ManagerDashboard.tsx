"use client";

import React from 'react';
import {
    Plus,
    Scissors,
    CheckCircle2,
    Search,
    AlertTriangle,
    History,
    Calendar,
    ChevronRight,
    Package,
    Clock,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useDailyReport, useTickets, useDashboardStats, useAdvancedTickets } from '../hooks/useDashboardData';
import { Modal } from '@/shared/components/ui/Modal';
import { TicketDetailView } from './ticket-details/TicketDetailView';
import { AdvancedTicketForm } from './AdvancedTicketForm';
import { useState } from 'react';
import {
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
    BarChart,
    Bar
} from 'recharts';
import { formatCurrency, cn } from '@/shared/lib/utils';

interface Props {
    user: any;
}

const operationalData = [
    { name: 'Lun', tickets: 12, completados: 8 },
    { name: 'Mar', tickets: 15, completados: 12 },
    { name: 'Mie', tickets: 10, completados: 9 },
    { name: 'Jue', tickets: 18, completados: 14 },
    { name: 'Vie', tickets: 22, completados: 18 },
    { name: 'Sab', tickets: 25, completados: 20 },
    { name: 'Dom', tickets: 8, completados: 7 },
];

export function ManagerDashboard({ user }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { report, loading: reportLoading } = useDailyReport(user?.assigned_branch_id);
    const { tickets, loading: ticketsLoading, refetch } = useTickets(searchTerm);
    const { stats, loading: statsLoading } = useDashboardStats();

    const firstName = user?.full_name?.split(' ')[0] || 'Encargado';
    const summary = report?.summary || { totalCash: 0, totalCard: 0, totalTransfer: 0, totalExpenses: 0 };
    const totalVenta = summary.totalCash + summary.totalCard + summary.totalTransfer;

    const isLoading = reportLoading || ticketsLoading || statsLoading;

    // Lógica de Prioridades
    const today = new Date().toISOString().split('T')[0];
    const urgentTickets = tickets.filter(t => t.status !== 'delivered' && t.delivery_date === today).slice(0, 5);
    const overdueTickets = tickets.filter(t => t.status !== 'delivered' && t.delivery_date < today).slice(0, 5);
    const abandonedTickets = tickets.filter(t => {
        const lastUpdate = new Date(t.updated_at);
        const diffDays = Math.ceil((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
        return t.status === 'ready' && diffDays >= 30;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Command Center Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
                        <span className="p-2 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/20">
                            <Scissors className="text-white" size={24} />
                        </span>
                        Command Center
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Sede: {firstName} · {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            placeholder="TECLEA NOTA, NOMBRE O TELÉFONO..."
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-5 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-black text-sm tracking-widest uppercase placeholder:text-slate-300 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-orange-500 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95 flex-shrink-0"
                    >
                        <Plus size={20} />
                        Nueva Nota
                    </button>
                </div>
            </div>

            {/* Dashboard Speed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Recibidos Hoy" value={stats?.received || "0"} icon={Package} color="orange" border="border-orange-500" />
                <KPICard title="Por Entregar" value={overdueTickets.length.toString()} icon={Clock} color="blue" border="border-blue-500" />
                <KPICard title="Abandonados (30d+)" value={abandonedTickets.length.toString()} icon={AlertTriangle} color="purple" border="border-purple-500" />
                <KPICard title="Caja Total" value={formatCurrency(totalVenta)} icon={TrendingUp} color="emerald" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Work Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em]">Cola de Trabajo Activa</h3>
                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{tickets.length} Órdenes</span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[2rem] animate-pulse" />)}
                        </div>
                    ) : tickets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tickets.slice(0, 6).map((t: any) => (
                                <QuickTicketCard
                                    key={t.id}
                                    ticket={t}
                                    onClick={() => {
                                        setSelectedTicket(t);
                                        setIsDetailModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Sin órdenes activas</p>
                        </div>
                    )}
                </div>

                {/* Priority Sidebar */}
                <div className="space-y-8">
                    {/* Urgentes HOY */}
                    <div className="glass-card p-8 border-none shadow-2xl bg-white rounded-[2.5rem]">
                        <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-6 flex items-center justify-between">
                            Urgentes Hoy
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        </h3>
                        <div className="space-y-4">
                            {urgentTickets.length > 0 ? urgentTickets.map((t: any) => (
                                <div key={t.id} onClick={() => { setSelectedTicket(t); setIsDetailModalOpen(true); }} className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-orange-600 uppercase">NOTA {t.ticket_number}</span>
                                        <History size={14} className="text-orange-400" />
                                    </div>
                                    <p className="text-xs font-black text-slate-800 truncate">{t.client?.full_name}</p>
                                    <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-tight">Para HOY</p>
                                </div>
                            )) : (
                                <p className="text-center py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin urgencias hoy</p>
                            )}
                        </div>
                    </div>

                    {/* Retrasados */}
                    {overdueTickets.length > 0 && (
                        <div className="glass-card p-8 border-none shadow-2xl bg-rose-50 rounded-[2.5rem]">
                            <h3 className="font-black text-rose-600 uppercase text-[11px] tracking-[0.2em] mb-6">Retrasados / Vencidos</h3>
                            <div className="space-y-4">
                                {overdueTickets.map((t: any) => (
                                    <div key={t.id} onClick={() => { setSelectedTicket(t); setIsDetailModalOpen(true); }} className="p-4 bg-white/80 border border-rose-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black text-rose-600 uppercase">NOTA {t.ticket_number}</span>
                                            <AlertTriangle size={14} className="text-rose-400" />
                                        </div>
                                        <p className="text-xs font-black text-slate-800 truncate">{t.client?.full_name}</p>
                                        <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">FECHA VENCIDA</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nueva Orden de Servicio" className="max-w-5xl">
                <AdvancedTicketForm onClose={() => setIsCreateModalOpen(false)} onSuccess={() => { setIsCreateModalOpen(false); refetch(); }} />
            </Modal>

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detalles - Nota ${selectedTicket?.ticket_number}`} className="max-w-5xl">
                {selectedTicket && (
                    <TicketDetailView ticket={selectedTicket} onUpdate={() => { setIsDetailModalOpen(false); refetch(); }} />
                )}
            </Modal>
        </div>
    );
}

function QuickTicketCard({ ticket, onClick }: { ticket: any, onClick: () => void }) {
    const statusMap: Record<string, { label: string, color: string, bg: string }> = {
        received: { label: 'Recibido', color: 'text-amber-600', bg: 'bg-amber-100' },
        processing: { label: 'En Proceso', color: 'text-orange-600', bg: 'bg-orange-100' },
        ready: { label: 'Listo', color: 'text-emerald-600', bg: 'bg-emerald-100' },
        delivered: { label: 'Entregado', color: 'text-slate-600', bg: 'bg-slate-100' }
    };
    const status = statusMap[ticket.status] || statusMap.received;

    return (
        <div onClick={onClick} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-orange-500/10 transition-all group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />

            <div className="flex justify-between items-start mb-6 relative">
                <div>
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 uppercase tracking-widest mb-2 block w-fit">NOTA {ticket.ticket_number}</span>
                    <h4 className="font-black text-lg text-slate-800 truncate max-w-[140px] tracking-tight">{ticket.client?.full_name}</h4>
                </div>
                <div className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm", status.bg, status.color)}>
                    {status.label}
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8 relative">
                <div className="flex -space-x-2">
                    {ticket.items?.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {item.garment_name[0]}
                        </div>
                    ))}
                    {ticket.items?.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                            +{ticket.items.length - 3}
                        </div>
                    )}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.items?.length || 0} Prendas</span>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">{new Date(ticket.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase">Saldo</span>
                    <span className={cn("text-xs font-black", ticket.balance_due > 0 ? "text-amber-500" : "text-emerald-500")}>
                        {formatCurrency(ticket.balance_due)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, change, isPositive, icon: Icon, color, border }: any) {
    const colorClasses = {
        orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    }[color as string] || "bg-orange-500/10 text-orange-600 border-orange-500/20";

    return (
        <div className={cn("glass-card p-8 flex flex-col gap-6 border-l-4 shadow-xl hover:scale-[1.02] transition-all", border)}>
            <div className="flex items-center justify-between">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm", colorClasses)}>
                    <Icon size={24} />
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black tracking-tight",
                    isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{title}</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
            </div>
        </div>
    );
}
