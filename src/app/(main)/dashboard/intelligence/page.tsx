"use client";

import React from 'react';
import { Sparkles, Activity, Zap, Brain, TrendingUp, Users, MessageSquare, CheckCircle2, AlertCircle, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function IntelligencePage() {
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Agent Status */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card overflow-hidden group">
                        <div className="p-8 border-b border-border bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                                    <Brain className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground tracking-tight">Sastre AI: Customer Support</h3>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Entrenamiento al día
                                    </p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                Re-Entrenar Modelo
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <IQMetric label="Tickets Resueltos" value="1,248" trend="+12%" />
                            <IQMetric label="Satisfacción" value="98.2%" trend="+0.5%" />
                            <IQMetric label="Tiempo Ahorrado" value="42h" trend="+15%" />
                        </div>
                    </div>

                    {/* Automation Logs */}
                    <div className="glass-card">
                        <div className="p-8 border-b border-border flex items-center justify-between">
                            <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] flex items-center gap-2">
                                <Activity className="text-primary" size={16} />
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
                            <AutomationLogItem
                                name="Webhook WhatsApp Sync"
                                status="Success"
                                time="Hace 1 hora"
                                latency="210ms"
                            />
                        </div>
                    </div>
                </div>

                {/* Lead Gen & Marketing Stats */}
                <div className="space-y-8">
                    <div className="glass-card p-8 bg-gradient-to-b from-card to-background">
                        <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em] mb-8 flex items-center gap-2">
                            <TrendingUp className="text-emerald-500" size={16} />
                            Lead Gen Dashboard
                        </h3>
                        <div className="space-y-6">
                            <StatBar label="Conversión WhatsApp" percent={68} color="bg-primary" />
                            <StatBar label="Alcance Orgánico" percent={42} color="bg-emerald-500" />
                            <StatBar label="Engagement Campañas" percent={85} color="bg-amber-500" />
                            <StatBar label="Retención de Leads" percent={30} color="bg-blue-500" />
                        </div>
                        <div className="mt-10 p-4 bg-secondary/30 rounded-2xl border border-border">
                            <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed text-center">
                                "Sastre AI detectó un aumento de interés en <span className="text-primary font-bold">arreglos express</span> durante las últimas 24h."
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-8 group cursor-pointer hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <BarChart3 size={24} />
                            </div>
                            <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-black text-foreground text-sm tracking-tight">Reportes de Crecimiento IA</h4>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Predicción de ingresos para el siguiente Q4 basado en tendencias actuales.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IQMetric({ label, value, trend }: any) {
    return (
        <div className="p-4 bg-secondary/30 border border-border/50 rounded-2xl">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">{value}</span>
                <span className="text-[10px] font-bold text-emerald-500">{trend}</span>
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
