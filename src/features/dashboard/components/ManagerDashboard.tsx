"use client";

import React from 'react';
import {
    TrendingUp,
    Ticket,
    Users,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Plus,
    Scissors,
    CheckCircle2
} from 'lucide-react';
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
    const firstName = user?.full_name?.split(' ')[0] || 'Encargado';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Bienvenido, {firstName}</h1>
                    <p className="text-muted-foreground text-sm font-medium">Gestión operativa de tu sede asignada.</p>
                </div>
                <button className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all hover:-translate-y-1">
                    <Plus size={18} />
                    Nuevo Ticket
                </button>
            </div>

            {/* Operational KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Prod. del Día"
                    value="18"
                    change="+3"
                    isPositive={true}
                    icon={Scissors}
                    color="orange"
                    border="border-orange-500"
                />
                <KPICard
                    title="Tickets Pendientes"
                    value="12"
                    change="-2"
                    isPositive={true}
                    icon={Ticket}
                    color="blue"
                    border="border-blue-500"
                />
                <KPICard
                    title="Venta del Turno"
                    value={formatCurrency(4200)}
                    change="+15%"
                    isPositive={true}
                    icon={TrendingUp}
                    color="emerald"
                    border="border-emerald-500"
                />
                <KPICard
                    title="Satisfacción"
                    value="4.9"
                    change="+0.2"
                    isPositive={true}
                    icon={CheckCircle2}
                    color="purple"
                    border="border-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Productivity Chart */}
                <div className="lg:col-span-2 glass-card p-8 shadow-2xl border-none">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-1">Productividad de Sede</h3>
                            <p className="text-xs text-muted-foreground font-medium">Tickets vs Entregas</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Input</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Output</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={operationalData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis hide={true} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                                />
                                <Bar dataKey="tickets" fill="#F97316" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="completados" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priority Tickets */}
                <div className="glass-card p-8 border-none shadow-2xl bg-gradient-to-b from-card to-background">
                    <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-8">Prioridad / Urgentes</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 bg-white/50 border border-slate-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase">HOY - 18:00</span>
                                    <span className="text-[10px] font-black text-slate-400">#ST-03{i}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">Ajuste de Saco - Juan Perez</h4>
                                <div className="flex items-center gap-2 mt-3">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500">Restan 4 horas</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-500/20 transition-all">
                        Ver todas las entregas
                    </button>
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
