"use client";

import React from 'react';
import { Shield, Users, Smartphone, Zap, Activity, Globe, ArrowUpRight, Cpu, Server, Database, Globe2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Shield className="text-indigo-600" size={28} />
                    </div>
                    Infraestructura Global
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Estado consolidado del ecosistema SastrePro SaaS.</p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Dueños Activos" value="128" icon={Users} color="indigo" border="border-indigo-500" />
                <StatCard label="Bots WhatsApp Online" value="342" icon={Smartphone} color="emerald" border="border-emerald-500" />
                <StatCard label="MRR Total" value="$182,400" icon={Zap} color="orange" border="border-orange-500" />
                <StatCard label="Uptime Sistema" value="99.99%" icon={Globe} color="amber" border="border-amber-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="xl:col-span-2 glass-card overflow-hidden shadow-2xl border-none">
                    <div className="p-8 border-b border-border flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] flex items-center gap-2">
                            <Activity size={18} className="text-indigo-600" />
                            Log de Operaciones Globales
                        </h3>
                    </div>
                    <div className="divide-y divide-border bg-card">
                        <ActivityItem type="new_owner" text="Nuevo dueño registrado: 'Sastrería El Corte'" time="Hace 12 min" />
                        <ActivityItem type="payment" text="Pago recibido: Suscripción Plan Pro (#8492)" time="Hace 45 min" />
                        <ActivityItem type="whatsapp" text="API WhatsApp reconectada - Sede Norte" time="Hace 1 hora" />
                        <ActivityItem type="new_owner" text="Dueño 'Stitch & Sew' actualizó su plan" time="Hace 3 horas" />
                    </div>
                </div>

                {/* Infrastructure Health */}
                <div className="glass-card p-8 border-none shadow-2xl bg-gradient-to-b from-card to-background">
                    <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-8 flex items-center gap-2">
                        <Server size={18} className="text-indigo-600" />
                        Salud de Servicios
                    </h3>
                    <div className="space-y-6">
                        <HealthItem icon={Database} label="PostgreSQL (Supabase)" status="Normal" score={98} />
                        <HealthItem icon={Cpu} label="Edge Functions" status="Normal" score={100} />
                        <HealthItem icon={Globe2} label="CRM Main Engine" status="Heavy Load" score={72} warning />
                        <HealthItem icon={Smartphone} label="WhatsApp Gateway" status="Normal" score={95} />
                    </div>
                    <button className="w-full mt-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm">
                        Ver Monitor Pro
                        <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, border }: any) {
    const colors: any = {
        indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/10",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10",
        orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/10",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10",
    };

    return (
        <div className={cn("glass-card p-6 flex items-center gap-4 hover:scale-[1.02] transition-all border-l-4 shadow-lg", border)}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", colors[color])}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-2xl font-black text-foreground">{value}</p>
            </div>
        </div>
    );
}

function ActivityItem({ text, time, type }: any) {
    return (
        <div className="p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    type === 'new_owner' ? "bg-primary" : type === 'payment' ? "bg-emerald-500" : "bg-muted-foreground"
                )} />
                <span className="text-sm font-medium text-foreground/80">{text}</span>
            </div>
            <span className="text-xs text-muted-foreground">{time}</span>
        </div>
    );
}

function HealthItem({ label, status, score, warning, icon: Icon }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2 font-bold text-muted-foreground">
                    <Icon size={14} className="text-primary/70" />
                    {label}
                </div>
                <span className={cn("font-black uppercase tracking-tighter", warning ? "text-amber-500" : "text-emerald-500")}>
                    {status}
                </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-1000", warning ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-emerald-500 to-emerald-400")}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}

