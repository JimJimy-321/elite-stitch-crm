"use client";

import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight, Activity, Receipt, CreditCard } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { useFinanceStats, useDailyReport } from '@/features/dashboard/hooks/useDashboardData';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function FinancePage() {
    const { user } = useAuthStore();
    const { stats, loading: statsLoading } = useFinanceStats();
    const { report, loading: reportLoading } = useDailyReport(user?.assigned_branch_id);

    const isLoading = statsLoading || reportLoading;

    if (isLoading) return <div className="p-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Cargando Inteligencia Financiera...</div>;

    const summary = report?.summary || { totalCash: 0, totalCard: 0, totalTransfer: 0, totalExpenses: 0 };
    const movements = [...(report?.payments || []), ...(report?.expenses || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Wallet className="text-orange-600" size={28} />
                        </div>
                        Control Financiero
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Monitoreo en tiempo real de ingresos, egresos y salud fiscal de tu negocio.</p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-xl shadow-slate-200/50">
                    <Calendar size={20} className="text-orange-500" />
                    <span className="text-sm font-black text-foreground uppercase tracking-widest px-2 border-l border-slate-100 italic">{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FinanceStat label="Ingresos Totales" value={formatCurrency(stats?.totalIncome || 0)} trend="+0%" positive border="border-l-indigo-500" />
                <FinanceStat label="Gastos Operativos" value={formatCurrency(stats?.totalExpenses || 0)} trend="0%" negative border="border-l-rose-500" />
                <FinanceStat label="Cuentas por Cobrar" value={formatCurrency(stats?.totalReceivable || 0)} trend="+0%" positive primary border="border-l-orange-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Daily Cash Flow */}
                <div className="xl:col-span-2 glass-card border-none shadow-2xl overflow-hidden bg-white rounded-[2rem]">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-black text-foreground flex items-center gap-3 text-lg tracking-tight">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Activity size={20} className="text-orange-600" />
                            </div>
                            Monitor de Caja Diario
                        </h3>
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 bg-orange-50 hover:bg-orange-100 px-6 py-3 rounded-xl border border-orange-200 transition-all shadow-sm">
                            Exportar Reporte
                        </button>
                    </div>
                    <div className="p-10 space-y-10">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Progreso Meta Mensual</span>
                                    <p className="text-2xl font-black text-foreground">$50,000.00 <span className="text-slate-300 font-medium">Objetivo</span></p>
                                </div>
                                <span className="text-xl font-black text-orange-600">85%</span>
                            </div>
                            <div className="h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner p-1">
                                <div className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 w-[85%] rounded-full shadow-lg shadow-orange-500/20 animate-pulse" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                            <MiniStat label="Efectivo" value={formatCurrency(summary.totalCash)} icon={<DollarSign size={14} />} />
                            <MiniStat label="Tarjeta" value={formatCurrency(summary.totalCard)} icon={<CreditCard size={14} />} />
                            <MiniStat label="Transferencias" value={formatCurrency(summary.totalTransfer)} icon={<TrendingUp size={14} />} />
                            <MiniStat label="Gastos" value={formatCurrency(summary.totalExpenses)} icon={<Receipt size={14} />} />
                        </div>
                    </div>
                </div>

                {/* Recent Movements */}
                <div className="glass-card flex flex-col border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <h3 className="font-black text-foreground flex items-center gap-3 text-lg tracking-tight">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Receipt size={20} className="text-orange-600" />
                            </div>
                            Últimos Movimientos
                        </h3>
                    </div>
                    <div className="p-4 flex-1">
                        <div className="space-y-3">
                            {movements.length > 0 ? movements.slice(0, 5).map((m: any) => (
                                <MovementItem
                                    key={m.id}
                                    type={m.payment_type ? 'income' : 'expense'}
                                    label={m.payment_type ? `Pago - Folio ${m.ticket_id.split('-')[0]}` : (m.description || 'Gasto Operativo')}
                                    amount={m.payment_type ? `+${formatCurrency(m.amount)}` : `-${formatCurrency(m.amount)}`}
                                    time={new Date(m.created_at).toLocaleTimeString()}
                                />
                            )) : (
                                <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">Sin movimientos hoy</p>
                            )}
                        </div>
                    </div>
                    <button className="p-8 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all border-t border-slate-50 flex items-center justify-center gap-3 group">
                        Ver historial completo
                        <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function FinanceStat({ label, value, trend, positive, negative, primary, border }: any) {
    return (
        <div className={cn(
            "glass-card p-10 group relative overflow-hidden border-none shadow-2xl bg-white transition-all hover:scale-[1.02] duration-500",
            border,
            "border-l-8"
        )}>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">{label}</p>
            <div className="flex items-end justify-between gap-4">
                <h2 className={cn("text-4xl font-black tracking-tighter text-foreground group-hover:text-orange-600 transition-colors")}>{value}</h2>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black shadow-sm",
                    positive && "text-emerald-600 bg-emerald-50 border-emerald-100",
                    negative && "text-rose-600 bg-rose-50 border-rose-100"
                )}>
                    {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, icon }: any) {
    return (
        <div className="space-y-2 p-5 bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl transition-all shadow-inner hover:shadow-xl hover:shadow-slate-200/50 group">
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-orange-500 transition-colors">
                {icon}
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
            </div>
            <p className="text-xl font-black text-foreground tracking-tight">{value}</p>
        </div>
    );
}

function MovementItem({ type, label, amount, time }: any) {
    return (
        <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-transparent hover:border-slate-100 hover:bg-slate-50/50 hover:shadow-lg hover:shadow-slate-200/30 transition-all group cursor-default">
            <div className="flex items-center gap-5">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-sm",
                    type === 'income' ? "bg-emerald-50 border-emerald-100 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" : "bg-rose-50 border-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
                )}>
                    {type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                    <p className="text-[15px] font-black text-foreground tracking-tight group-hover:text-orange-600 transition-colors truncate max-w-[150px]">{label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{time}</p>
                </div>
            </div>
            <span className={cn(
                "text-lg font-black tracking-tight",
                type === 'income' ? "text-emerald-500" : "text-rose-500"
            )}>{amount}</span>
        </div>
    );
}

