"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, User, Phone, Calendar, Scissors, Tag, CreditCard, AlertCircle } from 'lucide-react';
import { useClients, useBranches, useGarments, useServices, useAdvancedNotas } from '../hooks/useDashboardData';
import { dashboardService } from '../services/dashboardService';
import { cn } from '@/shared/lib/utils';
import { translateError } from '@/shared/lib/error-handler';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface AdvancedNotaFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function AdvancedNotaForm({ onClose, onSuccess }: AdvancedNotaFormProps) {
    const { user } = useAuthStore();
    const [clientSearch, setClientSearch] = useState('');
    const debouncedClientSearch = useDebounce(clientSearch, 500);
    const { clients } = useClients(debouncedClientSearch);
    const { branches } = useBranches();
    const { garments } = useGarments();
    const { services } = useServices();
    const { createNota, checkNotaExists, loading: isSubmitting } = useAdvancedNotas();
    const [submittingError, setSubmittingError] = useState<string | null>(null);
    const [notaNumberError, setNotaNumberError] = useState<string | null>(null);
    const [isValidatingNota, setIsValidatingNota] = useState(false);

    const [notaNumber, setNotaNumber] = useState<string>('');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [showClientResults, setShowClientResults] = useState(false);

    // Auto-select branch from user
    const [selectedBranch, setSelectedBranch] = useState<any>(null);

    useEffect(() => {
        if (branches.length > 0) {
            const branch = user?.assigned_branch_id
                ? branches.find(b => b.id === user.assigned_branch_id)
                : branches[0];
            if (branch) setSelectedBranch(branch);
        }
    }, [user, branches]);

    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [discountCode, setDiscountCode] = useState<string>('');
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);

    const filteredClients = clients.slice(0, 5);

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
    const balance = Math.max(0, total - payment.amount);

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
        setItems(prevItems => prevItems.map(i => {
            if (i.id !== id) return i;

            let processedValue = value;
            if (field === 'price') {
                processedValue = value === '' ? 0 : Number(value);
            } else if (typeof value === 'string' && field !== 'priority') {
                processedValue = value.toUpperCase();
            }

            return { ...i, [field]: processedValue };
        }));
    };

    const validateNotaNumber = async (val: string) => {
        if (!val || val.length === 0) return;
        setIsValidatingNota(true);
        setNotaNumberError(null);
        try {
            const exists = await checkNotaExists(val);
            if (exists) {
                setNotaNumberError("EL NÚMERO DE NOTA YA EXISTE");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsValidatingNota(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, nextFieldId?: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextFieldId) {
                const nextEl = document.getElementById(nextFieldId);
                if (nextEl) nextEl.focus();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingError(null);

        if (!notaNumber || notaNumber.length > 6) {
            setSubmittingError("Ingresa un número de nota válido (1-6 dígitos)");
            return;
        }

        if (notaNumberError) {
            setSubmittingError("Corrige el número de nota antes de finalizar");
            return;
        }

        if (!selectedClient) {
            setSubmittingError("Selecciona un cliente");
            return;
        }

        const notaData = {
            ticket_number: notaNumber,
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
            price: Number(item.price) || 0,
            priority: item.priority
        }));

        const paymentData = {
            amount: payment.amount,
            method: payment.method
        };

        try {
            await createNota(notaData, itemData, paymentData);
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setSubmittingError(translateError(err));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[85vh] overflow-y-auto px-2 pb-10">
            {submittingError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <p className="text-[11px] font-black uppercase tracking-tight">{submittingError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 ml-2">Número de Nota</label>
                    <div className="relative group">
                        <input
                            id="field-nota-number"
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            required
                            className={cn(
                                "w-full bg-white border-2 rounded-2xl px-10 h-14 font-black text-lg tracking-[0.2em] outline-none transition-all text-right",
                                notaNumberError ? "border-red-500 bg-red-50" : "border-slate-100 focus:border-orange-500"
                            )}
                            value={notaNumber}
                            onChange={(e) => {
                                const val = e.target.value.trim().replace(/\D/g, '');
                                setNotaNumber(val);
                                setNotaNumberError(null);
                            }}
                            onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val) validateNotaNumber(val);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    validateNotaNumber(notaNumber);
                                    handleKeyDown(e, 'field-client-search');
                                }
                            }}
                        />
                        <Tag className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", notaNumberError ? "text-red-400" : "text-orange-400")} size={18} />
                        {isValidatingNota && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    {notaNumberError && (
                        <p className="text-[10px] font-black text-red-500 px-2 animate-in fade-in slide-in-from-top-1">{notaNumberError}</p>
                    )}
                </div>

                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cliente</label>
                    <div className="relative group">
                        <input
                            id="field-client-search"
                            type="text"
                            placeholder="BUSCAR POR NOMBRE O TEL..."
                            autoComplete="off"
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-10 h-14 font-bold text-slate-700 focus:border-orange-500 outline-none transition-all uppercase"
                            value={selectedClient ? selectedClient.full_name : clientSearch}
                            onChange={(e) => {
                                setClientSearch(e.target.value.toUpperCase());
                                setSelectedClient(null);
                                setShowClientResults(true);
                            }}
                            onFocus={() => setShowClientResults(true)}
                            onKeyDown={(e) => handleKeyDown(e, 'field-delivery-date')}
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

                        {(selectedClient || clientSearch) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedClient(null);
                                    setClientSearch('');
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {showClientResults && clientSearch && !selectedClient && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
                            {filteredClients.length > 0 ? (
                                filteredClients.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className="w-full px-5 py-4 text-left hover:bg-orange-50 transition-colors flex flex-col border-b border-slate-50 last:border-0"
                                        onClick={() => {
                                            setSelectedClient(c);
                                            setShowClientResults(false);
                                        }}
                                    >
                                        <span className="font-black text-slate-800 text-xs uppercase">{c.full_name}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{c.phone}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-5 text-center space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">No se encontraron clientes</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sucursal</label>
                    <div className="relative">
                        <select
                            disabled
                            className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl px-5 h-14 font-bold text-slate-500 appearance-none cursor-not-allowed"
                            value={selectedBranch?.id || ''}
                        >
                            <option value={selectedBranch?.id}>{selectedBranch?.name || 'Cargando...'}</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Fecha de entrega</label>
                    <div className="relative group">
                        <input
                            id="field-delivery-date"
                            type="date"
                            required
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-10 h-14 font-bold text-slate-700 focus:border-orange-500 outline-none transition-all"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Prendas y Arreglos</label>
                    <button
                        type="button"
                        onClick={addItem}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={14} /> Añadir Prenda
                    </button>
                </div>

                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 group animate-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="text-[10px] font-black text-orange-500 bg-orange-50 w-7 h-7 rounded-xl flex items-center justify-center shrink-0">
                                    {index + 1}
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    <select
                                        id={`item-garment-${item.id}`}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 h-11 text-[11px] font-bold outline-none focus:border-orange-500 transition-all cursor-pointer uppercase"
                                        value={item.garment}
                                        required
                                        onChange={(e) => updateItem(item.id, 'garment', e.target.value)}
                                    >
                                        <option value="">PRENDA...</option>
                                        {garments.map(g => <option key={g.id} value={g.name.toUpperCase()}>{g.name.toUpperCase()}</option>)}
                                    </select>
                                    <select
                                        id={`item-service-${item.id}`}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 h-11 text-[11px] font-bold outline-none focus:border-orange-500 transition-all cursor-pointer uppercase"
                                        value={item.service}
                                        required
                                        onChange={(e) => updateItem(item.id, 'service', e.target.value)}
                                    >
                                        <option value="">ARREGLO...</option>
                                        {services.map(s => <option key={s.id} value={s.name.toUpperCase()}>{s.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 shrink-0">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    id={`item-desc-${item.id}`}
                                    placeholder="DESCRIPCIÓN RÁPIDA..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 h-11 text-[11px] font-bold outline-none focus:border-orange-500 transition-all uppercase"
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        className="w-full bg-slate-100 border-none rounded-xl px-4 h-11 text-[10px] font-black outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer uppercase tracking-widest text-orange-600"
                                        value={item.priority}
                                        onChange={(e) => updateItem(item.id, 'priority', e.target.value)}
                                    >
                                        <option value="normal">NORMAL</option>
                                        <option value="express">EXPRESS</option>
                                    </select>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">$</span>
                                        <input
                                            id={`item-price-${item.id}`}
                                            type="number"
                                            placeholder="0"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-6 pr-4 h-11 text-[12px] font-black outline-none focus:border-orange-500 text-right"
                                            value={item.price || ''}
                                            required
                                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Venta Total</p>
                        <p className="text-4xl font-black tracking-tighter text-white">${total.toLocaleString()}</p>
                        {appliedDiscount && (
                            <p className="text-[10px] text-emerald-400 font-bold uppercase animate-pulse">
                                Ahorro: -${discountAmount.toLocaleString()}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Código de Descuento</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 h-12 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-black uppercase text-xs"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyDiscount();
                                    }
                                }}
                                placeholder="CÓDIGO"
                            />
                            <button
                                type="button"
                                onClick={handleApplyDiscount}
                                className="bg-orange-500 hover:bg-orange-600 px-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20"
                            >
                                <Tag size={18} />
                            </button>
                        </div>
                        {discountError && (
                            <p className="text-[10px] text-rose-400 font-black uppercase">{discountError}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Anticipo</label>
                        <div className="relative">
                            <input
                                id="field-payment-amount"
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-12 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-black text-right pr-10"
                                value={payment.amount || ''}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setPayment({ ...payment, amount: val });
                                }}
                                placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">$</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Método de Pago</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-12 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-black text-xs text-white [&>option]:bg-slate-900 [&>option]:text-white"
                            value={payment.method}
                            onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex gap-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Total Parcial</p>
                            <p className="text-lg font-black text-slate-400 font-mono">${subtotal.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">Saldo Pendiente</p>
                            <p className={cn("text-3xl font-black tracking-tighter", balance > 0 ? "text-amber-400" : "text-emerald-400")}>
                                ${balance.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/40 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                Finalizar Nota
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
