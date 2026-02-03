"use client";

import React from 'react';
import { Shield, Users, Smartphone, Zap, Activity, Globe, ArrowUpRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    <Shield className="text-accent" />
                    Superadmin Infrastructure
                </h1>
                <p className="text-slate-400 text-sm">Estado global del ecosistema SastrePro SaaS.</p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Dueños Activos" value="128" icon={Users} color="indigo" />
                <StatCard label="Bots WhatsApp Online" value="342" icon={Smartphone} color="emerald" />
                <StatCard label="MRR Total" value="$182,400" icon={Zap} color="cyan" />
                <StatCard label="Uptime Sistema" value="99.99%" icon={Globe} color="amber" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="xl:col-span-2 glass-card bg-slate-900 overflow-hidden text-white">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold">Log de Operaciones Globales</h3>
                        <Activity size={18} className="text-slate-500" />
                    </div>
                    <div className="divide-y divide-white/5">
                        <ActivityItem type="new_owner" text="Nuevo dueño registrado: 'Sastrería El Corte'" time="Hace 12 min" />
                        <ActivityItem type="payment" text="Pago recibido: Suscripción Plan Pro (#8492)" time="Hace 45 min" />
                        <ActivityItem type="whatsapp" text="API WhatsApp reconectada - Sede Norte" time="Hace 1 hora" />
                        <ActivityItem type="new_owner" text="Dueño 'Stitch & Sew' actualizó su plan" time="Hace 3 horas" />
                    </div>
                </div>

                {/* Infrastructure Health */}
                <div className="glass-card bg-slate-900 p-8 text-white">
                    <h3 className="font-bold mb-6">Salud de Servicios</h3>
                    <div className="space-y-6">
                        <HealthItem label="Base de Datos (Supabase)" status="Normal" score={98} />
                        <HealthItem label="Edge Functions" status="Normal" score={100} />
                        <HealthItem label="CRM Main Engine" status="Heavy Load" score={72} warning />
                        <HealthItem label="WhatsApp Webhook" status="Normal" score={95} />
                    </div>
                    <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        Ver Monitor en Tiempo Real
                        <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        indigo: "bg-indigo-500/10 text-indigo-500",
        emerald: "bg-emerald-500/10 text-emerald-500",
        cyan: "bg-cyan-500/10 text-cyan-500",
        amber: "bg-amber-500/10 text-amber-500",
    };

    return (
        <div className="glass-card bg-slate-900 p-6 flex items-center gap-4 border border-white/5">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors[color])}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
            </div>
        </div>
    );
}

function ActivityItem({ text, time, type }: any) {
    return (
        <div className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    type === 'new_owner' ? "bg-accent" : type === 'payment' ? "bg-emerald-500" : "bg-slate-500"
                )} />
                <span className="text-sm font-medium text-slate-300">{text}</span>
            </div>
            <span className="text-xs text-slate-500">{time}</span>
        </div>
    );
}

function HealthItem({ label, status, score, warning }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">{label}</span>
                <span className={cn("font-black uppercase tracking-tighter", warning ? "text-amber-500" : "text-emerald-500")}>
                    {status}
                </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-1000", warning ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}
