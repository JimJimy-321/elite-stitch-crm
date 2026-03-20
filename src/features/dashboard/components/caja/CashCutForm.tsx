'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Calculator, CheckCircle2, AlertTriangle, Banknote, ArrowLeft } from 'lucide-react';

import { CashCutState, getCashCutState, performCashCut } from '@/features/dashboard/actions/cash-cut-actions';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { formatCurrency } from '@/shared/lib/utils';

const cashCutSchema = z.object({
    initialCash: z.coerce.number().min(0, "El efectivo inicial no puede ser negativo"),
    withdrawnCash: z.coerce.number().min(0, "El retiro no puede ser negativo"),
    notes: z.string().optional(),
    countedCash: z.coerce.number().min(0, "El conteo no puede ser negativo"),
    countedCard: z.coerce.number().min(0, "El conteo no puede ser negativo"),
    countedTransfer: z.coerce.number().min(0, "El conteo no puede ser negativo"),
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

    const form = useForm<CashCutFormValues>({
        resolver: zodResolver(cashCutSchema) as any,
        defaultValues: {
            initialCash: 0,
            withdrawnCash: 0,
            notes: '',
            countedCash: 0,
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
        } else {
            toast.error('Error al cargar estado de caja: ' + res.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadState();
    }, [branchId]);

    const onSubmit = (data: CashCutFormValues) => {
        if (!state) return;

        startTransition(async () => {
            const res = await performCashCut({
                branchId,
                userId,
                ...data
            });

            if (res.success) {
                toast.success('Corte de caja realizado exitosamente');
                form.reset();
                loadState();
            } else {
                toast.error('Error al realizar corte: ' + res.message);
            }
        });
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
    }

    if (!state) return <div className="text-red-500">No se pudo cargar la información de la caja.</div>;

    const { totals } = state;

    const watchedCountedCash = form.watch('countedCash');
    const watchedWithdrawn = form.watch('withdrawnCash');

    const difference = watchedCountedCash - totals.calculatedCash;
    const cashLeft = watchedCountedCash - watchedWithdrawn;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 bg-white border-b border-slate-200">
                <button 
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-[#1e3a8a]">Reporte Corte de Caja</h1>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                    
                    {/* Columna Izquierda: Información Básica */}
                    <Card className="border border-slate-200 shadow-sm rounded-xl h-fit">
                        <CardHeader className="border-b border-slate-100 bg-white">
                            <CardTitle className="text-lg font-bold text-slate-700">Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-600 block">Caja</label>
                                <select 
                                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-500 text-sm focus:outline-none cursor-not-allowed"
                                    disabled
                                    value="main"
                                >
                                    <option value="main">Sucursal Principal</option>
                                </select>
                            </div>

                            <FormInput label="Efectivo inicial" name="initialCash" form={form} disabled={true} />
                            
                            <FormInput label="Efectivo retirado" name="withdrawnCash" form={form} />

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-600 block">Notas</label>
                                <textarea
                                    {...form.register('notes')}
                                    className="w-full h-24 p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-400 resize-none"
                                    placeholder="Notas adicionales..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Columna Derecha: Declaración de Ventas */}
                    <Card className="border border-slate-200 shadow-sm rounded-xl h-fit">
                        <CardHeader className="border-b border-slate-100 bg-white">
                            <CardTitle className="text-lg font-bold text-slate-700">Declaración de Ventas</CardTitle>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                                Los movimientos de entrada y salida de la caja también son contados dentro del total
                            </p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Concepto</th>
                                        <th className="px-6 py-4 text-center">Contado</th>
                                        <th className="px-6 py-4 text-right">Calculado</th>
                                        <th className="px-6 py-4 text-right">Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <FormTableRow 
                                        label="Efectivo" 
                                        name="countedCash" 
                                        calculated={totals.calculatedCash} 
                                        form={form} 
                                    />
                                    <FormTableRow 
                                        label="Tarjeta" 
                                        name="countedCard" 
                                        calculated={totals.cardSales} 
                                        form={form} 
                                    />
                                    <FormTableRow 
                                        label="Transferencia" 
                                        name="countedTransfer" 
                                        calculated={totals.transferSales} 
                                        form={form} 
                                    />
                                </tbody>
                                <tfoot className="bg-slate-50/50 font-bold border-t border-slate-100">
                                    <TotalRow 
                                        form={form} 
                                        totals={{
                                            expected: totals.calculatedCash + totals.cardSales + totals.transferSales
                                        }} 
                                    />
                                </tfoot>
                            </table>

                            {/* Alerta de Discrepancia Global */}
                            {watchedCountedCash > 0 && Math.abs(difference) > 50 && (
                                <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="text-red-500 shrink-0" size={20} />
                                    <p className="text-xs text-red-700 leading-relaxed font-medium">
                                        <strong>DISCREPANCIA ALTA:</strong> La diferencia en efectivo supera los $50. 
                                        Verifica el conteo físico antes de proceder.
                                    </p>
                                </div>
                            )}

                            {/* Importe a Dejar en Caja (Informativo al estilo original pero integrado) */}
                            <div className="m-6 pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-slate-700">Importe Total a Dejar en Caja:</span>
                                    <span className="text-xl font-black text-slate-900">{formatCurrency(cashLeft)}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    (Conteo Efectivo - Efectivo Retirado). Este será el fondo inicial para la próxima jornada.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>

            {/* Bottom Action Bar */}
            <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10">
                <div className="max-w-7xl mx-auto flex gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => window.history.back()}
                        className="flex-1 h-12 rounded-lg bg-slate-400 hover:bg-slate-500 text-white border-none font-bold"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        className="flex-1 h-12 rounded-lg bg-[#0047ab] hover:bg-[#003580] text-white border-none font-bold"
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        Guardar
                    </Button>
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, name, form, disabled }: any) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-bold text-slate-600 block">{label}</label>
            <div className="relative">
                <input
                    {...form.register(name)}
                    type="number"
                    step="0.01"
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed font-medium"
                    disabled={disabled}
                />
            </div>
            {form.formState.errors[name] && (
                <span className="text-[10px] text-red-500 font-medium block">{form.formState.errors[name]?.message}</span>
            )}
        </div>
    );
}

function FormTableRow({ label, name, calculated, form }: any) {
    const value = form.watch(name) || 0;
    const diff = Number(value) - calculated;

    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-700">{label}</td>
            <td className="px-6 py-4">
                <input
                    {...form.register(name)}
                    type="number"
                    step="0.01"
                    className="w-24 h-9 px-2 text-center border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
            </td>
            <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(calculated)}</td>
            <td className={`px-6 py-4 text-right font-bold ${diff === 0 ? 'text-blue-500' : diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(diff)}
            </td>
        </tr>
    );
}

function TotalRow({ form, totals }: any) {
    const countedCash = Number(form.watch('countedCash') || 0);
    const countedCard = Number(form.watch('countedCard') || 0);
    const countedTransfer = Number(form.watch('countedTransfer') || 0);
    
    const totalCounted = countedCash + countedCard + countedTransfer;
    const totalExpected = totals.expected;
    const totalDiff = totalCounted - totalExpected;

    return (
        <tr>
            <td className="px-6 py-5 text-slate-800">Total</td>
            <td className="px-6 py-5 text-center text-slate-800">{formatCurrency(totalCounted)}</td>
            <td className="px-6 py-5 text-right text-slate-800">{formatCurrency(totalExpected)}</td>
            <td className={`px-6 py-5 text-right ${totalDiff === 0 ? 'text-blue-500' : totalDiff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(totalDiff)}
            </td>
        </tr>
    );
}
