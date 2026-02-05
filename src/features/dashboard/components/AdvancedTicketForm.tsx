"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, User, Phone, Calendar, Scissors, Tag, CreditCard, AlertCircle } from 'lucide-react';
import { useClients, useBranches, useGarments, useServices, useAdvancedTickets } from '../hooks/useDashboardData';
import { dashboardService } from '../services/dashboardService';
import { cn } from '@/shared/lib/utils';
import { translateError } from '@/shared/lib/error-handler';

interface AdvancedTicketFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function AdvancedTicketForm({ onClose, onSuccess }: AdvancedTicketFormProps) {
    const { clients } = useClients();
    const { branches } = useBranches();
    const { garments } = useGarments();
    const { services } = useServices();
    const { createTicket, loading: isSubmitting } = useAdvancedTickets();
    const [submittingError, setSubmittingError] = useState<string | null>(null);

    const [ticketNumber, setTicketNumber] = useState<string>('');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [discountCode, setDiscountCode] = useState<string>('');
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);

    const [items, setItems] = useState<any[]>([
        { id: Date.now(), garment: '', service: '', description: '', price: 0, priority: 'normal' }
    ]);

    const [payment, setPayment] = useState({
        amount: 0,
        method: 'efectivo'
    });

    const subtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

    const calculateDiscount = () => {
        if (!appliedDiscount) return 0;
        if (appliedDiscount.discount_type === 'percentage') {
            return (subtotal * appliedDiscount.value) / 100;
        }
        return appliedDiscount.value;
    };

    const discountAmount = calculateDiscount();
    const total = Math.max(0, subtotal - discountAmount);
    const balance = total - payment.amount;

    const handleApplyDiscount = async () => {
        setDiscountError(null);
        if (!discountCode) return;

        try {
            const disc = await dashboardService.getDiscountByCode(discountCode);
            if (disc) {
                setAppliedDiscount(disc);
            } else {
                setDiscountError("Código no válido o expirado");
            }
        } catch (err) {
            setDiscountError("Error validando código");
        }
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), garment: '', service: '', description: '', price: 0, priority: 'normal' }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingError(null);

        if (!ticketNumber || ticketNumber.length !== 6) {
            setSubmittingError("Ingresa un número de nota válido (6 dígitos)");
            return;
        }

        if (!selectedClient) {
            setSubmittingError("Selecciona un cliente");
            return;
        }

        const ticketData = {
            ticket_number: ticketNumber,
            branch_id: selectedBranch?.id || branches[0]?.id,
            client_id: selectedClient.id,
            delivery_date: deliveryDate,
            notes: notes,
            total_amount: total,
            balance_due: balance,
            discount_id: appliedDiscount?.id,
            discount_amount: discountAmount
        };

        const itemData = items.map(item => ({
            garment_name: item.garment,
            service_name: item.service,
            description: item.description,
            price: item.price,
            priority: item.priority
        }));

        const paymentData = {
            amount: payment.amount,
            method: payment.method
        };

        try {
            await createTicket(ticketData, itemData, paymentData);
            onSuccess();
        } catch (err) {
            console.error(err);
            setSubmittingError(translateError(err));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto px-2">
            {submittingError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <p className="text-[11px] font-black uppercase tracking-tight">{submittingError}</p>
                </div>
            )}
            {/* Seccion Info Basica */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Número de Nota</label>
                    <div className="relative group">
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            required
                            className="input-field pl-10 h-14 font-black text-lg tracking-widest"
                            value={ticketNumber}
                            onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, ''))}
                        />
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" size={18} />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</label>
                    <div className="relative group">
                        <select
                            required
                            className="input-field pl-10 h-14"
                            onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value))}
                        >
                            <option value="">Seleccionar Cliente...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
                            ))}
                        </select>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sucursal</label>
                    <select
                        required
                        className="input-field h-14"
                        value={selectedBranch?.id || ''}
                        onChange={(e) => setSelectedBranch(branches.find(b => b.id === e.target.value))}
                    >
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Promesa</label>
                    <div className="relative group">
                        <input
                            type="date"
                            required
                            className="input-field pl-10 h-14"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                </div>
            </div>

            {/* Seccion Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prendas y Arreglos</label>
                    <button
                        type="button"
                        onClick={addItem}
                        className="text-orange-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                        <Plus size={14} /> Añadir Prenda
                    </button>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id} className="glass-card bg-slate-50/50 p-6 space-y-4 border-slate-100 group animate-in slide-in-from-left-2 duration-300">
                            <div className="flex items-start justify-between">
                                <span className="text-[11px] font-black text-orange-500 bg-orange-50 w-6 h-6 rounded-full flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <select
                                    className="input-field bg-white"
                                    value={item.garment}
                                    required
                                    onChange={(e) => updateItem(item.id, 'garment', e.target.value)}
                                >
                                    <option value="">Tipo de Prenda...</option>
                                    {garments.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                                </select>

                                <select
                                    className="input-field bg-white"
                                    value={item.service}
                                    required
                                    onChange={(e) => updateItem(item.id, 'service', e.target.value)}
                                >
                                    <option value="">Tipo de Arreglo...</option>
                                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        placeholder="Precio"
                                        className="input-field bg-white pl-8"
                                        value={item.price}
                                        required
                                        onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                    />
                                </div>
                            </div>
                            <input
                                placeholder="Notas específicas (ej: Entallar 2cm, color hilo...)"
                                className="input-field bg-white text-xs"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Seccion Pago */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Subtotal</p>
                        <p className="text-4xl font-black tracking-tighter">${subtotal.toLocaleString()}</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Código de Descuento</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold uppercase"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={handleApplyDiscount}
                                className="bg-white/20 hover:bg-white/30 px-4 rounded-xl transition-all"
                            >
                                <Tag size={18} />
                            </button>
                        </div>
                        {appliedDiscount && (
                            <p className="text-[10px] text-emerald-400 font-bold uppercase">
                                ✓ {appliedDiscount.description} (-${discountAmount.toLocaleString()})
                            </p>
                        )}
                        {discountError && (
                            <p className="text-[10px] text-rose-400 font-bold uppercase">{discountError}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anticipo</label>
                        <input
                            type="number"
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                            value={payment.amount}
                            onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Método</label>
                        <select
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                            value={payment.method}
                            onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Saldo Pendiente</p>
                        <p className={cn("text-2xl font-black tracking-tighter", balance > 0 ? "text-amber-400" : "text-emerald-400")}>
                            ${balance.toLocaleString()}
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Finalizar Nota
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
