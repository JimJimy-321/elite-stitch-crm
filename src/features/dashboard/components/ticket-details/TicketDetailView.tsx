"use client";

import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    CreditCard,
    PackageCheck,
    AlertCircle,
    ChevronRight,
    Scissors,
    ShieldCheck
} from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { useAdvancedTickets } from '../../hooks/useDashboardData';
import { translateError } from '@/shared/lib/error-handler';

interface Props {
    ticket: any;
    onUpdate: () => void;
}

export function TicketDetailView({ ticket, onUpdate }: Props) {
    const { updateStatus, collectPayment, deliver, loading } = useAdvancedTickets();
    const [error, setError] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(ticket.balance_due);
    const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');

    const handleUpdateStatus = async (itemId: string, newStatus: string) => {
        try {
            await updateStatus(itemId, newStatus);
            onUpdate();
        } catch (err) {
            setError(translateError(err));
        }
    };

    const handlePayment = async () => {
        if (paymentAmount <= 0) return;
        try {
            const type = paymentAmount >= ticket.balance_due ? 'liquidacion' : 'abono';
            await collectPayment(ticket.id, paymentAmount, paymentMethod, type, ticket.branch_id);
            onUpdate();
        } catch (err) {
            setError(translateError(err));
        }
    };

    const handleDeliver = async () => {
        if (ticket.balance_due > 0) {
            setError("No se puede entregar un ticket con saldo pendiente.");
            return;
        }
        try {
            await deliver(ticket.id);
            onUpdate();
        } catch (err) {
            setError(translateError(err));
        }
    };

    const allFinished = ticket.items?.every((i: any) => i.status === 'finished');

    return (
        <div className="space-y-8 max-h-[85vh] overflow-y-auto px-4 pb-10">
            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <p className="text-xs font-black uppercase">{error}</p>
                </div>
            )}

            {/* Header / Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado General</span>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                            ticket.status === 'delivered' ? "bg-slate-500 text-white" :
                                ticket.status === 'ready' ? "bg-emerald-500 text-white" :
                                    ticket.status === 'processing' ? "bg-orange-500 text-white" : "bg-amber-500 text-white"
                        )}>
                            {ticket.status === 'delivered' ? 'Entregado' :
                                ticket.status === 'ready' ? 'Listo' :
                                    ticket.status === 'processing' ? 'En Proceso' : 'Recibido'}
                        </div>
                        <span className="text-xl font-black text-slate-800 tracking-tighter">{ticket.ticket_number}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total</span>
                        <span className="text-2xl font-black text-slate-900">{formatCurrency(ticket.total_amount)}</span>
                    </div>
                    {ticket.balance_due > 0 ? (
                        <div className="text-right border-l border-slate-200 pl-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">Saldo</span>
                            <span className="text-2xl font-black text-amber-600">{formatCurrency(ticket.balance_due)}</span>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" size={20} />
                            <span className="text-xs font-black text-emerald-600 uppercase">Pagado</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Items / Prendas */}
            <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Prendas en Orden</h3>
                <div className="grid gap-4">
                    {ticket.items?.map((item: any) => (
                        <div key={item.id} className="glass-card bg-white p-6 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                                    item.status === 'finished' ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-500"
                                )}>
                                    <Scissors size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">{item.garment_name} - {item.service_name}</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{item.description || 'Sin notas adicionales'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-300 uppercase block">Precio</span>
                                    <span className="font-black text-slate-700">{formatCurrency(item.price)}</span>
                                </div>
                                <div className="flex gap-2">
                                    {item.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, 'in_process')}
                                            className="px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                                        >
                                            Iniciar Trabajo
                                        </button>
                                    )}
                                    {item.status === 'in_process' && (
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, 'finished')}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg active:scale-95"
                                        >
                                            Marcar Terminado
                                        </button>
                                    )}
                                    {item.status === 'finished' && (
                                        <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                            <CheckCircle2 size={14} />
                                            Listo
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Acciones de Pago y Entrega */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {ticket.balance_due > 0 ? (
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-4 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-3">
                            <CreditCard size={14} /> Liquidar Saldo
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Monto</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                                        value={paymentAmount}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setPaymentAmount(val > ticket.balance_due ? ticket.balance_due : val);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Método</label>
                                    <select
                                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-xs text-white [&>option]:bg-slate-900 [&>option]:text-white"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta</option>
                                        <option value="transferencia">Transferencia</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                            >
                                {loading ? 'Procesando...' : 'Registrar Pago'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-500 rounded-[2rem] p-6 text-white space-y-2 shadow-2xl flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-1">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight">¡Cuenta Saldada!</h3>
                        <p className="text-[10px] font-medium opacity-90">No hay saldos pendientes para esta nota.</p>
                    </div>
                )}

                <div className={cn(
                    "rounded-[2rem] p-6 space-y-4 shadow-2xl flex flex-col justify-between transition-all border-4",
                    ticket.status === 'delivered' ? "bg-slate-50 border-slate-100" : (allFinished && ticket.balance_due <= 0 ? "bg-white border-emerald-500 shadow-emerald-500/10" : "bg-white border-slate-50 opacity-60")
                )}>
                    <div className="space-y-2">
                        <h3 className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3",
                            ticket.status === 'delivered' ? "text-slate-400" : "text-emerald-600"
                        )}>
                            <PackageCheck size={16} /> Entrega al Cliente
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 leading-tight">
                            {ticket.status === 'delivered'
                                ? 'Esta orden ya fue entregada satisfactoriamente.'
                                : (allFinished ? 'Todo listo. Procede con la entrega física.' : 'Aún hay prendas en proceso de costura.')
                            }
                        </p>
                    </div>

                    {ticket.status !== 'delivered' && (
                        <button
                            disabled={!allFinished || ticket.balance_due > 0 || loading}
                            onClick={handleDeliver}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl",
                                allFinished && ticket.balance_due <= 0
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30 active:scale-95"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Entrega Final'}
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
