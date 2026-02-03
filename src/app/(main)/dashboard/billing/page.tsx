"use client";

import React from 'react';
import { CreditCard, Check, ShieldCheck, Zap, ArrowRight, History, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function BillingPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-5xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <CreditCard className="text-orange-600" size={28} />
                    </div>
                    Suscripción SastrePro
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Gestiona tu plan comercial y métodos de pago de forma segura.</p>
            </div>

            {/* Current Plan Card */}
            <div className="glass-card p-1 overflow-hidden relative border-none shadow-[0_32px_64px_-16px_rgba(249,115,22,0.15)] bg-card rounded-[2.5rem]">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
                    <Zap size={280} className="text-orange-500" />
                </div>

                <div className="p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="flex items-center gap-10">
                        <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-orange-400 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 rotate-3 group-hover:rotate-0 transition-all duration-700">
                            <Sparkles size={56} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <h2 className="text-4xl font-black text-foreground tracking-tighter">Plan Profesional Elite</h2>
                                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-full border border-emerald-100 tracking-[0.15em] shadow-sm">Activo</span>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium">
                                Próxima renovación: <span className="text-foreground font-black underline decoration-orange-500/30 decoration-4">20 de Febrero, 2026</span>
                            </p>
                            <div className="flex items-center gap-2 mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg w-fit">
                                <ShieldCheck size={14} />
                                Cuenta Verificada SastrePro
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-5 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner min-w-[320px]">
                        <p className="text-5xl font-black text-foreground tracking-tighter">$1,490 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mt-1">MXN / Pago Mensual</span></p>
                        <button className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-foreground/20">
                            <CreditCard size={18} />
                            Portal de Pagos Stripe
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Features Included */}
                <div className="glass-card p-1 border-none shadow-2xl bg-card">
                    <div className="p-10">
                        <h3 className="font-black text-[11px] uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-foreground">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
                                <Check className="text-orange-500" size={20} />
                            </div>
                            Beneficios de tu Suscripción
                        </h3>
                        <div className="space-y-6">
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
                <div className="glass-card p-1 border-none shadow-2xl bg-card">
                    <div className="p-10">
                        <h3 className="font-black text-[11px] uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-foreground">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                <History className="text-orange-500" size={20} />
                            </div>
                            Historial de Facturación
                        </h3>
                        <div className="space-y-3">
                            <HistoryRecord id="#SP-2024-01" date="Ene 20, 2026" amount="$1,490 MXN" />
                            <HistoryRecord id="#SP-2023-12" date="Dic 20, 2025" amount="$1,490 MXN" />
                            <HistoryRecord id="#SP-2023-11" date="Nov 20, 2025" amount="$1,490 MXN" />
                        </div>
                        <button className="mt-10 w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-orange-600 hover:bg-orange-50 rounded-2xl border border-dashed border-slate-200 hover:border-orange-500/30 transition-all flex items-center justify-center gap-3">
                            Ver historial completo
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Footer */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 py-16 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700">
                <div className="flex items-center gap-4 border-r border-slate-200 pr-12 last:border-0 last:pr-0">
                    <ShieldCheck size={24} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Pagos Seguros vía Stripe</span>
                </div>
                <div className="flex items-center gap-4 border-r border-slate-200 pr-12 last:border-0 last:pr-0">
                    <CreditCard size={24} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">SSL 256-bit Encrypted</span>
                </div>
                <div className="flex items-center gap-4 border-r border-slate-200 pr-12 last:border-0 last:pr-0">
                    <Zap size={24} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Procesamiento IA</span>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-5 group cursor-default">
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300">
                <Check size={16} className="text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-foreground transition-colors tracking-tight">{label}</span>
        </div>
    );
}

function HistoryRecord({ id, date, amount }: any) {
    return (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-500/30 hover:bg-white transition-all group shadow-sm">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:border-orange-500/20 shadow-sm">
                    <History size={18} className="text-orange-500/70" />
                </div>
                <div>
                    <span className="text-xs font-black text-foreground block tracking-tight">{id}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{date}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-sm font-black text-foreground block">{amount}</span>
                <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Pagado</span>
            </div>
        </div>
    );
}

