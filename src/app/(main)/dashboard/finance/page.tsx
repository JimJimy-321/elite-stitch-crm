"use client";

import React from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/utils';

export default function FinancePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Control de Caja</h1>
                <p className="text-muted text-sm">Registro de ingresos, egresos y gastos operativos diario.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ArrowDownCircle className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Saldo Hoy</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(4850)}</p>
                    <p className="text-xs text-muted mt-1 underline cursor-pointer">Ver detalle de ingresos</p>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ArrowUpCircle className="text-red-500" />
                        </div>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Gastos Hoy</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(1200)}</p>
                    <p className="text-xs text-muted mt-1 underline cursor-pointer">Registrar nuevo gasto</p>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-accent">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Wallet className="text-accent" />
                        </div>
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Meta Mensual</span>
                    </div>
                    <p className="text-2xl font-bold">75%</p>
                    <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-accent w-3/4" />
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="p-6 border-b border-border flex items-center gap-2">
                    <History size={18} className="text-muted" />
                    <h3 className="text-lg font-bold">Movimientos Recientes</h3>
                </div>
                <div className="p-12 text-center">
                    <p className="text-muted text-sm italic">Cargando historial de movimientos...</p>
                </div>
            </div>
        </div>
    );
}
