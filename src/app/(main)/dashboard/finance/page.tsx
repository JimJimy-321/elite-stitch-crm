"use client";

import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight, Activity, Receipt, CreditCard } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';

export default function FinancePage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <Wallet className="text-primary" size={28} />
                        </div>
                        Control Financiero
                    </h1>
                    <p className="text-muted-foreground text-sm">Monitoreo en tiempo real de ingresos, egresos y salud fiscal.</p>
                </div>
                <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm">
                    <Calendar size={18} className="text-primary" />
                    <span className="text-sm font-black text-foreground">Octubre 2023</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FinanceStat label="Ingresos Totales" value={formatCurrency(42850)} trend="+12.4%" positive />
                <FinanceStat label="Gastos Operativos" value={formatCurrency(12400)} trend="-3.2%" negative />
                <FinanceStat label="Balance Neto" value={formatCurrency(30450)} trend="+18.1%" positive primary />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Daily Cash Flow */}
                <div className="xl:col-span-2 glass-card overflow-hidden">
                    <div className="p-8 border-b border-border flex justify-between items-center bg-card/50">
                        <h3 className="font-black text-foreground flex items-center gap-3">
                            <Activity size={18} className="text-primary" />
                            Monitor de Caja Diario
                        </h3>
                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 transition-all">
                            Exportar Reporte
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progreso Meta Mensual ($50k)</span>
                                <span className="text-sm font-black text-primary">85%</span>
                            </div>
                            <div className="h-4 bg-secondary rounded-full overflow-hidden border border-border shadow-inner">
                                <div className="h-full bg-gradient-to-r from-primary to-primary/60 w-[85%] rounded-full shadow-lg shadow-primary/20 animate-pulse" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                            <MiniStat label="Efectivo" value="$8,200" />
                            <MiniStat label="Stripe" value="$24,500" />
                            <MiniStat label="Transferencias" value="$9,150" />
                            <MiniStat label="Otros" value="$1,000" />
                        </div>
                    </div>
                </div>

                {/* Recent Movements */}
                <div className="glass-card flex flex-col">
                    <div className="p-8 border-b border-border">
                        <h3 className="font-black text-foreground flex items-center gap-3">
                            <Receipt size={18} className="text-primary" />
                            Últimos Movimientos
                        </h3>
                    </div>
                    <div className="p-4 flex-1">
                        <div className="space-y-2">
                            <MovementItem type="income" label="Pedido #4292 - Sucursal Norte" amount="+$1,450.00" time="Hace 12 min" />
                            <MovementItem type="expense" label="Pago de Insumos - Telas Elite" amount="-$3,200.00" time="Hace 45 min" />
                            <MovementItem type="income" label="Ajuste Pro - Cliente VIP" amount="+$850.00" time="Hace 2 horas" />
                            <MovementItem type="income" label="Pedido #4291 - Sucursal Sur" amount="+$2,100.00" time="Hace 3 horas" />
                        </div>
                    </div>
                    <button className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all border-t border-border flex items-center justify-center gap-2">
                        Ver todo el historial
                        <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function FinanceStat({ label, value, trend, positive, negative, primary }: any) {
    return (
        <div className={cn(
            "glass-card p-8 group relative overflow-hidden",
            primary && "border-t-4 border-t-primary shadow-2xl shadow-primary/10"
        )}>
            {primary && (
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={120} className="text-primary" />
                </div>
            )}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">{label}</p>
            <div className="flex items-end justify-between gap-4">
                <h2 className={cn("text-3xl font-black text-foreground", primary && "text-primary")}>{value}</h2>
                <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-black",
                    positive && "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                    negative && "text-red-500 bg-red-500/10 border-red-500/20"
                )}>
                    {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-sm font-black text-foreground">{value}</p>
        </div>
    );
}

function MovementItem({ type, label, amount, time }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/50 transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                    type === 'income' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" : "bg-red-500/5 border-red-500/10 text-red-500"
                )}>
                    {type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div>
                    <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors truncate max-w-[150px]">{label}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{time}</p>
                </div>
            </div>
            <span className={cn(
                "text-sm font-black",
                type === 'income' ? "text-emerald-500" : "text-red-500"
            )}>{amount}</span>
        </div>
    );
}

