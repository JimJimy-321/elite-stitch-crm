"use client";

import React from 'react';
import { CreditCard, Check, ShieldCheck, Zap, ArrowRight, History } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function BillingPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Suscripción y Membresía</h1>
                <p className="text-muted text-sm">Gestiona tu plan comercial y métodos de pago mediante Stripe.</p>
            </div>

            {/* Current Plan Card */}
            <div className="glass-card p-1 overflow-hidden relative border-t-4 border-t-accent shadow-2xl shadow-accent/20">
                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center shadow-xl shadow-accent/30 rotate-3">
                            <Zap size={40} className="text-white -rotate-3" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-black">Plan Profesional</h2>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-md border border-emerald-500/20">Activo</span>
                            </div>
                            <p className="text-muted text-sm">Próximo cobro: <span className="text-foreground font-bold">20 de Febrero, 2026</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <p className="text-3xl font-black">$1,490 <span className="text-sm font-medium text-muted">/ mes</span></p>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all border border-white/5">
                            <CreditCard size={14} />
                            Gestionar en Stripe
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Features Included */}
                <div className="glass-card p-8">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Check className="text-emerald-500" />
                        Incluido en tu plan
                    </h3>
                    <div className="space-y-4">
                        <FeatureItem label="Hasta 5 Sucursales" />
                        <FeatureItem label="Marketing Masivo Ilimitado" />
                        <FeatureItem label="Agente de IA Ingestor" />
                        <FeatureItem label="Inbox WhatsApp Multisede" />
                        <FeatureItem label="Soporte Técnico 24/7" />
                    </div>
                </div>

                {/* Payment History */}
                <div className="glass-card p-8">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <History className="text-muted" />
                        Recibos Recientes
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg"><Check className="text-emerald-500" size={14} /></div>
                                <span className="font-bold">Factura #SP-2024-01</span>
                            </div>
                            <span className="text-muted font-bold">$1,490 MXN</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg"><Check className="text-emerald-500" size={14} /></div>
                                <span className="font-bold">Factura #SP-2023-12</span>
                            </div>
                            <span className="text-muted font-bold">$1,490 MXN</span>
                        </div>
                    </div>
                    <button className="mt-6 w-full py-2.5 text-xs font-bold text-muted hover:text-foreground hover:bg-secondary rounded-xl transition-all flex items-center justify-center gap-2">
                        Ver todo el historial
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-8 py-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Pagos Seguros vía Stripe</span>
                </div>
                <div className="w-px h-4 bg-muted/40" />
                <div className="flex items-center gap-2">
                    <CreditCard size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">SSL Encrypted</span>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ label }: any) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check size={12} className="text-emerald-500" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}
