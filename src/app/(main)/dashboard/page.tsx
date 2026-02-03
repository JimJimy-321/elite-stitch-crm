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
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, Juan</h1>
        <p className="text-muted">Aquí tienes el resumen consolidado de tus 4 sucursales.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Ingresos Totales"
          value={formatCurrency(144000)}
          change="+12.5%"
          isPositive={true}
          icon={TrendingUp}
          color="accent"
        />
        <KPICard
          title="Tickets Activos"
          value="84"
          change="+5.2%"
          isPositive={true}
          icon={ShoppingBag}
          color="blue"
        />
        <KPICard
          title="Nuevos Clientes"
          value="24"
          change="-2.4%"
          isPositive={false}
          icon={Users}
          color="purple"
        />
        <KPICard
          title="Tiempo Promedio"
          value="3.2 días"
          change="-0.5 días"
          isPositive={true}
          icon={Clock}
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Flujo de Ingresos Semanal</h3>
              <p className="text-sm text-muted">Consolidado todas las sedes</p>
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <MoreHorizontal size={20} className="text-muted" />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2E2C35" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  hide={true}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1A22', border: '1px solid #2E2C35', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Performance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6">Rendimiento por Sede</h3>
          <div className="space-y-6">
            {performanceData.map((branch) => (
              <div key={branch.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium">{branch.name}</span>
                  <span className="text-xs text-muted font-bold">{formatCurrency(branch.ingresos)}</span>
                </div>
                <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-accent transition-all duration-1000"
                    style={{ width: `${(branch.ingresos / 50000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20">
            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Insight IA</p>
            <p className="text-sm text-foreground/80">
              La "Sede Centro" muestra una rentabilidad del 72%, un 5% arriba del promedio general.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Tickets */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold">Tickets Recientes</h3>
          <button className="text-accent text-sm font-bold hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">No. Ticket</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Sede</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold">#ST-034{i}</td>
                  <td className="px-6 py-4 text-sm">Cliente Genérico {i}</td>
                  <td className="px-6 py-4 text-sm text-muted">Sede Norte</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      i % 2 === 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-warning-500/10 text-orange-400 border border-orange-500/20"
                    )}>
                      {i % 2 === 0 ? 'LISTO' : 'EN PROCESO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(1200 + (i * 150))}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted hover:text-white transition-colors">
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
  color: 'accent' | 'blue' | 'purple' | 'emerald';
}

function KPICard({ title, value, change, isPositive, icon: Icon, color }: KPICardProps) {
  const colorClasses = {
    accent: "bg-accent/20 text-accent border-accent/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  }[color] || "bg-accent/20 text-accent border-accent/30";

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-lg border", colorClasses)}>
          <Icon size={20} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
