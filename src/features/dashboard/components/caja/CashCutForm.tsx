'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

import { CashCutState, getCashCutState, performCashCut } from '@/features/dashboard/actions/cash-cut-actions';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency, cn } from '@/shared/lib/utils';

const cashCutSchema = z.object({
    initialCash: z.coerce.number().min(0, "Mínimo 0"),
    withdrawnCash: z.coerce.number().min(0, "Mínimo 0"),
    notes: z.string().optional(),
    countedCash: z.coerce.number().min(0, "Mínimo 0"),
    countedCard: z.coerce.number().min(0, "Mínimo 0"),
    countedTransfer: z.coerce.number().min(0, "Mínimo 0"),
});

type CashCutFormValues = z.infer<typeof cashCutSchema>;

interface CashCutFormProps {
    branchId: string;
    userId: string;
}

export function CashCutForm({ branchId, userId }: CashCutFormProps) {
    const [state, setState] = useState<CashCutState | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [withdrawnManual, setWithdrawnManual] = useState(false);

    const form = useForm<CashCutFormValues>({
        resolver: zodResolver(cashCutSchema as any),
        mode: 'onChange',
        defaultValues: {
            initialCash: 0,
            withdrawnCash: undefined as any,
            notes: '',
            countedCash: undefined as any,
            countedCard: 0,
            countedTransfer: 0,
        }
    });

    const loadState = async () => {
        setLoading(true);
        const res = await getCashCutState(branchId);
        if (res.success && res.data) {
            setState(res.data);
            form.setValue('initialCash', res.data.totals.initialCash);
            form.setValue('countedCard', res.data.totals.cardSales);
        } else {
            toast.error('Error al cargar estado de caja: ' + res.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadState();
    }, [branchId]);

    // Escuchar eventos de actualización (ej: desde ExpenseModal)
    useEffect(() => {
        const handleRefresh = () => {
            loadState();
        };
        window.addEventListener('cash-cut-refresh', handleRefresh);
        return () => window.removeEventListener('cash-cut-refresh', handleRefresh);
    }, [branchId]);

    const { totals } = state || { totals: { grossSales: 0, anticipos: 0, totalPending: 0, cardSales: 0, cashSales: 0, expensesCash: 0, initialCash: 0, withdrawnCash: 0, calculatedCash: 0, transferSales: 0, totalSales: 0 }};
    
    // Cálculo de valores esperados
    const efectivoEsperado = totals.calculatedCash;
    const tarjetaEsperado = totals.cardSales + totals.transferSales;
    const efectivoBruto = totals.initialCash + totals.cashSales;
    const totalVentas = efectivoBruto + tarjetaEsperado;
    
    const watchedCountedCash = form.watch('countedCash');
    const watchedWithdrawnCash = form.watch('withdrawnCash');

    // Sincronizar retiro con contado por defecto si el usuario no ha puesto un valor manual
    useEffect(() => {
        if (!withdrawnManual && watchedCountedCash !== undefined && !isNaN(watchedCountedCash)) {
            form.setValue('withdrawnCash', watchedCountedCash);
        }
    }, [watchedCountedCash, withdrawnManual, form]);

    const efectivoReal = watchedCountedCash !== undefined && !isNaN(watchedCountedCash) ? Number(watchedCountedCash) : 0;
    const efectivoRetirado = watchedWithdrawnCash !== undefined && !isNaN(watchedWithdrawnCash) ? Number(watchedWithdrawnCash) : 0;
    const diferencia = efectivoReal - efectivoEsperado;
    const efectivoDejado = efectivoReal - efectivoRetirado;

    const onSubmit = (data: CashCutFormValues) => {
        if (!state) return;
        // Obligar a que el campo de efectivo físico sea capturado si hay diferencia
        if (watchedCountedCash === undefined) {
             toast.error('Debes capturar el EFECTIVO FÍSICO en caja.');
             return;
        }
        if (efectivoRetirado > efectivoReal) {
             toast.error('La cantidad a RETIRAR no puede ser mayor al EFECTIVO FÍSICO real.');
             return;
        }
        if (diferencia !== 0 && (!data.notes || data.notes.trim() === '')) {
            toast.error('Hay una diferencia de efectivo. Debes capturar una OBSERVACIÓN.');
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        if (!state) return;
        const data = form.getValues();

        startTransition(async () => {
            const res = await performCashCut({
                branchId,
                userId,
                // Si el usuario no ingresa el físico, se envía el esperado (idealmente ya fue bloqueado arriba)
                countedCash: data.countedCash !== undefined ? data.countedCash : efectivoEsperado,
                countedCard: data.countedCard,
                countedTransfer: data.countedTransfer,
                withdrawnCash: data.withdrawnCash !== undefined ? data.withdrawnCash : (data.countedCash || efectivoEsperado),
                notes: data.notes
            });

            if (res.success) {
                toast.success("CORTE DE CAJA REALIZADO EXITOSAMENTE");
                setShowConfirm(false);
                form.reset();
                loadState();
                
                router.push('/dashboard/finance');
            } else {
                toast.error("ERROR AL REALIZAR CORTE: " + res.message?.toUpperCase());
            }
        });
    };

    if (loading) {
        return <div className="p-8 flex items-center justify-center h-full"><Loader2 className="animate-spin text-orange-500 w-12 h-12" /></div>;
    }

    if (!state) return <div className="text-red-500 p-8 text-center font-bold">No se pudo cargar la información de la caja.</div>;

    return (
        <div className="w-full bg-black rounded-3xl shadow-2xl relative border-4 border-black">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full p-3 lg:p-4">
                
                {/* Contenedor central del Reporte */}
                <div className="w-full max-w-2xl mx-auto flex flex-col justify-center gap-[2px]">
                    
                    {/* Header */}
                    <div className="border-[1.5px] border-white bg-[#ea580c] py-0.5 px-3 text-center shadow-lg mb-1.5 lg:mb-2">
                        <h2 className="text-lg lg:text-xl font-black tracking-widest text-white uppercase leading-tight">CORTE DE CAJA</h2>
                    </div>

                    {/* Bloque 1 */}
                    <div className="flex flex-col gap-[1.5px] mb-1.5 lg:mb-2">
                        <TableRow label="Venta del Día" value={formatCurrency(totals.grossSales)} bgClass="bg-[#ea580c]" />
                        <TableRow label="A Cuenta" value={formatCurrency(totals.anticipos)} bgClass="bg-black" />
                        <TableRow label="Ventas Registradas" value={formatCurrency(totals.grossSales + totals.anticipos)} bgClass="bg-[#ea580c]" />
                    </div>

                    {/* Bloque 2 */}
                    <div className="flex flex-col gap-[1.5px] mb-1.5 lg:mb-2">
                        <TableRow label="Por Cobrar" value={formatCurrency(totals.totalPending)} bgClass="bg-black" />
                    </div>

                    {/* Bloque 3 */}
                    <div className="flex flex-col gap-[1.5px] mb-1.5 lg:mb-2">
                        <TableRow label="Efectivo" value={formatCurrency(efectivoBruto)} bgClass="bg-[#ea580c]" />
                        <TableRow label="Tarjetas" value={formatCurrency(totals.cardSales || 0)} bgClass="bg-black" />
                        <TableRow label="Transferencias" value={formatCurrency(totals.transferSales || 0)} bgClass="bg-black" />
                        <TableRow label="Total Ventas" value={formatCurrency(totalVentas)} bgClass="bg-[#ea580c]" />
                    </div>

                    {/* Bloque 4 */}
                    <div className="flex flex-col gap-[1.5px] mb-1.5 lg:mb-2">
                        <TableRow label="Efectivo" value={formatCurrency(efectivoBruto)} bgClass="bg-[#ea580c]" />
                        <TableRow label="(-) Gastos en Efectivo" value={formatCurrency(totals.expensesCash)} bgClass="bg-black" />
                    </div>

                    {/* Bloque 5 */}
                    <div className="flex flex-col gap-[1.5px] mb-1.5 lg:mb-2">
                        <TableRow label="Total en Caja" value={formatCurrency(efectivoEsperado)} bgClass="bg-[#ea580c]" />
                    </div>

                    {/* Bloque 5: Entradas del usuario */}
                    <div className="flex flex-col gap-[1.5px]">
                        <div className="flex gap-[1.5px]">
                            <div className="px-2 py-0.5 flex-[5] border-[1.5px] border-white bg-[#93400a] flex items-center">
                                <span className="font-bold uppercase tracking-wide text-[10px] lg:text-[12px] text-white leading-none pt-[1px]">EFECTIVO FÍSICO REAL</span>
                            </div>
                            <div className="px-2 py-0 flex-[4] border-[1.5px] border-white bg-[#93400a] flex items-center justify-end relative h-7 lg:h-8">
                                <span className="text-sm lg:text-[15px] font-normal text-white absolute left-2 leading-none pt-[1px]">$</span>
                                <input 
                                    {...form.register('countedCash', {
                                        setValueAs: (v) => v === "" ? undefined : parseFloat(v.toString().replace(/[^0-9.]/g, ""))
                                    })}
                                    type="text"
                                    inputMode="decimal"
                                    onBlur={(e) => {
                                        const val = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                        if (!isNaN(val)) {
                                            form.setValue('countedCash', val.toFixed(2) as any);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full h-full bg-transparent text-right text-sm lg:text-[15px] font-bold text-white focus:outline-none placeholder:text-white/30 leading-none pt-[1px]"
                                    placeholder="0.00"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Campo Retirado */}
                        <div className="flex gap-[1.5px] mt-[1.5px]">
                            <div className="px-2 py-0.5 flex-[5] border-[1.5px] border-white bg-black flex items-center">
                                <span className="font-bold uppercase tracking-wide text-[10px] lg:text-[12px] text-white leading-none pt-[1px]">EFECTIVO a RETIRAR (DEPÓSITO)</span>
                            </div>
                            <div className="px-2 py-0 flex-[4] border-[1.5px] border-white bg-black flex items-center justify-end relative h-7 lg:h-8">
                                <span className="text-sm lg:text-[15px] font-normal text-white absolute left-2 leading-none pt-[1px]">$</span>
                                <input 
                                    {...form.register('withdrawnCash', {
                                        setValueAs: (v) => v === "" ? undefined : parseFloat(v.toString().replace(/[^0-9.]/g, ""))
                                    })}
                                    type="text"
                                    inputMode="decimal"
                                    onChange={(e) => {
                                        setWithdrawnManual(true);
                                        const val = e.target.value.replace(/[^0-9.]/g, "");
                                        form.setValue('withdrawnCash', val === "" ? undefined : val as any);
                                    }}
                                    onBlur={(e) => {
                                        const val = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                        if (!isNaN(val)) {
                                            form.setValue('withdrawnCash', val.toFixed(2) as any);
                                        }
                                    }}
                                    className="w-full h-full bg-transparent text-right text-sm lg:text-[15px] font-bold text-white focus:outline-none placeholder:text-white/30 leading-none pt-[1px]"
                                    placeholder="0.00"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Efectivo Dejado */}
                        {efectivoReal > 0 && (
                            <div className="flex gap-[1.5px] mt-[1.5px]">
                                <div className="px-2 py-0.5 flex-[5] border-[1.5px] border-white bg-slate-800 flex items-center">
                                    <span className="font-bold uppercase tracking-wide text-[10px] lg:text-[12px] text-indigo-400 leading-none pt-[1px]">EFECTIVO DEJADO EN CAJA</span>
                                </div>
                                <div className="px-2 py-0 flex-[4] border-[1.5px] border-white bg-slate-800 flex items-center justify-end h-7 lg:h-8">
                                    <span className="text-sm lg:text-[15px] font-black text-white leading-none pt-[1px]">
                                        {formatCurrency(efectivoDejado)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {watchedCountedCash !== undefined && !isNaN(watchedCountedCash) && diferencia !== 0 && (
                            <div className="flex gap-[1.5px] animate-in slide-in-from-top-2 duration-300 mt-[1.5px]">
                                <div className={cn("px-2 py-0.5 lg:py-1 flex-[5] border-[1.5px] border-white flex items-center", diferencia < 0 ? "bg-rose-700" : "bg-emerald-700")}>
                                    <span className="font-bold uppercase tracking-wide text-[9px] lg:text-[11px] text-white leading-none">DIFERENCIA (Faltante/Sobrante)</span>
                                </div>
                                <div className={cn("px-2 py-0.5 lg:py-1 flex-[4] border-[1.5px] border-white flex items-center justify-end h-7 lg:h-8", diferencia < 0 ? "bg-rose-700" : "bg-emerald-700")}>
                                    <span className="font-normal text-[13px] lg:text-[15px] text-white leading-none">
                                        {diferencia > 0 ? '+' : ''}{formatCurrency(diferencia)}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-[1.5px] mt-[1.5px]">
                            <div className="px-2 py-1 flex-1 border-[1.5px] border-white bg-black flex items-center h-7 lg:h-8">
                                <input 
                                    {...form.register('notes')}
                                    type="text"
                                    className="w-full h-full bg-transparent text-[10px] lg:text-xs font-normal text-white focus:outline-none placeholder:text-white/40 uppercase leading-none"
                                    placeholder="OBSERVACIONES DE DIFERENCIA..."
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botón */}
                    <div className="mt-2 flex justify-center pb-1">
                        <button
                            type="button"
                            onClick={() => {
                                form.handleSubmit(onSubmit, (e) => {
                                    if (e.countedCash) {
                                         toast.error('Falta declarar el Efectivo Real');
                                    } else {
                                         toast.error('Revisa la captura de valores.');
                                    }
                                })();
                            }}
                            disabled={isPending}
                            className="h-9 w-full max-w-sm rounded-[6px] bg-[#ea580c] hover:bg-[#c2410a] text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-white"
                        >
                            {isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                            FINALIZAR Y CERRAR CAJA
                        </button>
                    </div>

                </div>
            </form>

            {/* Modal de Confirmación */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isPending && setShowConfirm(false)} />
                    <div className="bg-white rounded-xl w-full max-w-sm relative z-10 shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 pb-2 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-3">
                                <AlertTriangle size={24} className="text-orange-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tighter">¿CONFIRMAR CORTE?</h3>
                            <p className="text-xs font-medium text-slate-500 mb-2 uppercase">
                                EFECTIVO FÍSICO TOTAL APORTADO: <b className="text-slate-900">{formatCurrency(efectivoReal)}</b>
                            </p>
                              {diferencia !== 0 && (
                                <div className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase", diferencia < 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")}>
                                    DIFERENCIA: {formatCurrency(diferencia)}
                                </div>
                            )}
                        </div>

                        <div className="p-5 space-y-3">
                            <div className="flex gap-3 pt-1">
                                <Button 
                                    variant="secondary"
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 h-10 rounded-lg font-black uppercase tracking-widest text-[10px]"
                                    disabled={isPending}
                                >
                                    REVISAR
                                </Button>
                                <Button 
                                    onClick={handleConfirm}
                                    className="flex-[2] h-10 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[10px]"
                                    disabled={isPending}
                                >
                                    {isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <CheckCircle2 size={14} className="mr-2" />}
                                    SÍ, CERRAR CAJA
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper

function TableRow({ label, value, bgClass }: { label: React.ReactNode, value: React.ReactNode, bgClass: string }) {
    return (
        <div className="flex gap-[1.5px]">
            <div className={cn("px-2 py-[2px] lg:py-0.5 flex-[5] border-[1.5px] border-white flex items-center", bgClass)}>
                <span className="font-bold uppercase tracking-wide text-[10px] lg:text-[11px] text-white leading-none pt-[1px]">{label}</span>
            </div>
            <div className={cn("px-2 py-[2px] lg:py-0.5 flex-[4] border-[1.5px] border-white flex items-center justify-end", bgClass)}>
                <span className="font-normal text-[13px] lg:text-[15px] text-white leading-none pt-[1px]">{value}</span>
            </div>
        </div>
    );
}
