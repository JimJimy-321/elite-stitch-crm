"use client";

import React from 'react';
import { CreditCard, Check, ShieldCheck, Zap, ArrowRight, History, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function BillingPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-5xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                        <CreditCard className="text-primary" size={28} />
                    </div>
                    Suscripción y Membresía
                </h1>
                <p className="text-muted-foreground text-sm">Gestiona tu plan comercial y métodos de pago de forma segura.</p>
            </div>

            {/* Current Plan Card */}
            <div className="glass-card p-1 overflow-hidden relative border-t-4 border-t-primary shadow-2xl shadow-primary/10">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Zap size={120} className="text-primary" />
                </div>

                <div className="p-10 flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/40 rotate-3 group hover:rotate-0 transition-transform duration-500">
                            <Sparkles size={48} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black text-foreground">Plan Profesional</h2>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/20 tracking-widest">Activo</span>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium">
                                Próximo cobro: <span className="text-foreground font-bold">20 de Febrero, 2026</span>
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-primary">
                                <ShieldCheck size={14} />
                                Verificada por SastrePro Internal
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-4 bg-secondary/30 p-6 rounded-3xl border border-border">
                        <p className="text-4xl font-black text-foreground">$1,490 <span className="text-sm font-bold text-muted-foreground tracking-normal uppercase">MXN / mes</span></p>
                        <button className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-foreground text-background rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10">
                            <CreditCard size={16} />
                            Gestionar en Stripe
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Features Included */}
                <div className="glass-card p-1">
                    <div className="p-8">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-foreground">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Check className="text-emerald-500" size={18} />
                            </div>
                            Beneficios Incluidos
                        </h3>
                        <div className="space-y-5">
                            <FeatureItem label="Hasta 10 Sucursales conectadas" />
                            <FeatureItem label="Marketing Masivo Ilimitado (WhatsApp)" />
                            <FeatureItem label="Agente de IA Ingestor de Pedidos" />
                            <FeatureItem label="Inbox Multisede y Multicanal" />
                            <FeatureItem label="Soporte Prioritario Concierge" />
                            <FeatureItem label="Analítica de Negocio Avanzada" />
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="glass-card p-1">
                    <div className="p-8">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-foreground">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                <History className="text-primary" size={18} />
                            </div>
                            Historial de Facturación
                        </h3>
                        <div className="space-y-2">
                            <HistoryRecord id="#SP-2024-01" date="Ene 20, 2026" amount="$1,490 MXN" />
                            <HistoryRecord id="#SP-2023-12" date="Dic 20, 2025" amount="$1,490 MXN" />
                            <HistoryRecord id="#SP-2023-11" date="Nov 20, 2025" amount="$1,490 MXN" />
                        </div>
                        <button className="mt-8 w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl border border-dashed border-border hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                            Ver historial completo
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Footer */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 py-12 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700">
                <div className="flex items-center gap-3 border-r border-border pr-12 last:border-0 last:pr-0">
                    <ShieldCheck size={20} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Pagos Seguros vía Stripe</span>
                </div>
                <div className="flex items-center gap-3 border-r border-border pr-12 last:border-0 last:pr-0">
                    <CreditCard size={20} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">SSL 256-bit Encrypted</span>
                </div>
                <div className="flex items-center gap-3 border-r border-border pr-12 last:border-0 last:pr-0">
                    <Zap size={20} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Procesamiento Instantáneo</span>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-4 group cursor-default">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Check size={14} className="text-emerald-500" />
            </div>
            <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors tracking-tight">{label}</span>
        </div>
    );
}

function HistoryRecord({ id, date, amount }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border hover:border-primary/30 hover:bg-card transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border group-hover:border-primary/20">
                    <History size={16} className="text-primary/70" />
                </div>
                <div>
                    <span className="text-xs font-black text-foreground block">{id}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{date}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-sm font-black text-foreground block">{amount}</span>
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Pagado</span>
            </div>
        </div>
    );
}

