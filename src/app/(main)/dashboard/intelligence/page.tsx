"use client";

import React from 'react';
import { Sparkles, Activity, Zap, Brain, TrendingUp, Users, MessageSquare, CheckCircle2, AlertCircle, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function IntelligencePage() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role === 'manager') {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (!user || user.role === 'manager') return null;
    return (
        <div className="space-y-8 animate-fade-in max-w-6xl pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <Sparkles className="text-primary" size={28} />
                        </div>
                        Centro de Inteligencia
                    </h1>
                    <p className="text-muted-foreground text-sm">Monitoreo de IA, automatizaciones y métricas de conversión avanzadas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm">
                                {i}
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2 border-l border-border">Agentes Activos</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DashboardMetric label="Ingresos IA" value="$ 12,450.00" trend="+8%" color="border-orange-500" />
                <DashboardMetric label="Tickets Resueltos" value="94" trend="Eficiencia 92%" color="border-blue-500" />
                <DashboardMetric label="Completados" value="72" trend="77% Efectividad" color="border-emerald-500" />
                <DashboardMetric label="En Proceso" value="22" trend="2 pendientes" color="border-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Agent Status */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card overflow-hidden group border-t-4 border-t-primary">
                        <div className="p-8 border-b border-border bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <Brain className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground tracking-tight text-lg">Sastre AI: Customer Support</h3>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Entrenamiento al día
                                    </p>
                                </div>
                            </div>
                            <button className="px-5 py-2.5 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95">
                                Re-Entrenar Modelo
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <IQMetric label="Resolución" value="94%" trend="Excelente" color="text-primary" />
                            <IQMetric label="Satisfacción" value="98.2%" trend="+0.5%" color="text-orange-500" />
                            <IQMetric label="Latencia" value="45ms" trend="Ultra Rápido" color="text-emerald-500" />
                        </div>
                    </div>

                    {/* Automation Logs */}
                    <div className="glass-card border-none shadow-xl">
                        <div className="p-8 border-b border-border flex items-center justify-between bg-orange-50/50">
                            <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] flex items-center gap-2">
                                <Activity className="text-orange-500" size={16} />
                                Workflows de Automatización (n8n)
                            </h3>
                            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Ver Todos</button>
                        </div>
                        <div className="p-4 space-y-2">
                            <AutomationLogItem
                                name="Confirmación de Entrega"
                                status="Success"
                                time="Hace 2 min"
                                latency="450ms"
                            />
                            <AutomationLogItem
                                name="Recordatorio de Pago"
                                status="Success"
                                time="Hace 15 min"
                                latency="820ms"
                            />
                            <AutomationLogItem
                                name="Lead Ingestion: Facebook"
                                status="Warning"
                                time="Hace 42 min"
                                latency="1.2s"
                            />
                        </div>
                    </div>
                </div>

                {/* Lead Gen & Marketing Stats */}
                <div className="space-y-8">
                    <div className="glass-card p-8 bg-gradient-to-b from-card to-background border-t-4 border-t-orange-500 shadow-2xl">
                        <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-8 flex items-center gap-2">
                            <TrendingUp className="text-orange-500" size={16} />
                            Desempeño de Campañas
                        </h3>
                        <div className="space-y-6">
                            <StatBar label="Conversión WhatsApp" percent={68} color="bg-orange-500" />
                            <StatBar label="Alcance Orgánico" percent={42} color="bg-blue-500" />
                            <StatBar label="Engagement Campañas" percent={85} color="bg-emerald-500" />
                            <StatBar label="Retención de Leads" percent={30} color="bg-purple-500" />
                        </div>
                        <div className="mt-10 p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                            <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed text-center">
                                "Sastre AI detectó un aumento de interés en <span className="text-orange-600 font-bold">arreglos express</span> durante las últimas 24h."
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-8 group cursor-pointer hover:border-orange-500/30 transition-all border-l-4 border-l-orange-500 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-600">
                                <BarChart3 size={24} />
                            </div>
                            <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-black text-foreground text-sm tracking-tight">Reportes de Crecimiento IA</h4>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Predicción de ingresos para el siguiente Q4 basado en IA.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardMetric({ label, value, trend, color }: any) {
    return (
        <div className={cn("glass-card p-6 border-l-4 shadow-md", color)}>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-2xl font-black text-foreground tracking-tighter">{value}</h4>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">{trend}</p>
        </div>
    );
}

function IQMetric({ label, value, trend, color }: any) {
    return (
        <div className="p-5 bg-secondary/30 border border-border/50 rounded-2xl flex flex-col gap-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black", color)}>{value}</span>
                <span className="text-[10px] font-bold text-muted-foreground/50">{trend}</span>
            </div>
        </div>
    );
}

function AutomationLogItem({ name, status, time, latency }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-2xl hover:bg-secondary/40 transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'Success' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                )} />
                <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{name}</span>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-[10px] text-muted-foreground font-mono">{latency}</span>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter w-20 text-right">{time}</span>
            </div>
        </div>
    );
}

function StatBar({ label, percent, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", color)}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
