"use client";

import React from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency, cn } from '@/shared/lib/utils';

const salesData = [
  { name: 'Lun', total: 4500 },
  { name: 'Mar', total: 5200 },
  { name: 'Mie', total: 4800 },
  { name: 'Jue', total: 6100 },
  { name: 'Vie', total: 5900 },
  { name: 'Sab', total: 7200 },
  { name: 'Dom', total: 3100 },
];

const performanceData = [
  { name: 'Sede Norte', ingresos: 45000, rentabilidad: 65 },
  { name: 'Sede Sur', ingresos: 32000, rentabilidad: 58 },
  { name: 'Sede Este', ingresos: 28000, rentabilidad: 45 },
  { name: 'Sede Centro', ingresos: 39000, rentabilidad: 72 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Bienvenido, Juan</h1>
        <p className="text-muted-foreground text-sm font-medium">Aquí tienes el resumen consolidado de tus 4 sucursales.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Ingresos Totales"
          value={formatCurrency(144000)}
          change="+12.5%"
          isPositive={true}
          icon={TrendingUp}
          color="orange"
          border="border-orange-500"
        />
        <KPICard
          title="Tickets Activos"
          value="84"
          change="+5.2%"
          isPositive={true}
          icon={ShoppingBag}
          color="blue"
          border="border-blue-500"
        />
        <KPICard
          title="Nuevos Clientes"
          value="24"
          change="-2.4%"
          isPositive={false}
          icon={Users}
          color="purple"
          border="border-purple-500"
        />
        <KPICard
          title="Tiempo Promedio"
          value="3.2 días"
          change="-0.5 días"
          isPositive={true}
          icon={Clock}
          color="emerald"
          border="border-emerald-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Chart */}
        <div className="lg:col-span-2 glass-card p-8 shadow-2xl border-none">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-1">Flujo de Ingresos Semanal</h3>
              <p className="text-xs text-muted-foreground font-medium">Consolidado todas las sedes</p>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <MoreHorizontal size={20} className="text-muted-foreground" />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  hide={true}
                />
                <Tooltip
                  cursor={{ stroke: '#F97316', strokeWidth: 2, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#0F172A', fontWeight: 800, fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#F97316"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Performance */}
        <div className="glass-card p-8 border-none shadow-2xl bg-gradient-to-b from-card to-background">
          <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-8">Rendimiento por Sede</h3>
          <div className="space-y-8">
            {performanceData.map((branch) => (
              <div key={branch.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight">{branch.name}</span>
                  <span className="text-xs text-orange-600 font-black">{formatCurrency(branch.ingresos)}</span>
                </div>
                <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(branch.ingresos / 50000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10 border-l-4 border-l-orange-500">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Insight IA</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              La <span className="text-foreground font-bold">"Sede Centro"</span> muestra una rentabilidad del 72%, un 5% arriba del promedio general.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Tickets */}
      <div className="glass-card overflow-hidden shadow-2xl border-none bg-card">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em]">Tickets Recientes</h3>
          <button className="text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">No. Ticket</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Cliente</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Sede</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Estado</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Monto</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-6 text-xs font-black text-foreground tracking-tight">#ST-034{i}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-600 dark:text-slate-300">Cliente Genérico {i}</td>
                  <td className="px-8 py-6 text-xs font-medium text-muted-foreground">Sede Norte</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                      i % 2 === 0
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-orange-50 text-orange-600 border-orange-200"
                    )}>
                      {i % 2 === 0 ? 'LISTO' : 'EN PROCESO'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-black text-foreground">{formatCurrency(1200 + (i * 150))}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                      <MoreHorizontal size={18} />
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

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  color: 'orange' | 'blue' | 'purple' | 'emerald';
  border: string;
}

function KPICard({ title, value, change, isPositive, icon: Icon, color, border }: KPICardProps) {
  const colorClasses = {
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }[color] || "bg-orange-500/10 text-orange-600 border-orange-500/20";

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
