'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Calculator, CheckCircle2, AlertTriangle, Banknote } from 'lucide-react';

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
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-800">Corte de Caja</CardTitle>
                        <p className="text-sm text-slate-500">Cierre continuo desde último corte</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Seccion Izquierda: Inputs */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Datos de Entrada</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Efectivo Inicial" name="initialCash" form={form} disabled={true} />
                                <FormInput label="Retirar Efectivo" name="withdrawnCash" form={form} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 ml-1">Notas del Corte</label>
                                <textarea
                                    {...form.register('notes')}
                                    className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-orange-500 focus:ring-orange-500/20 min-h-[80px] resize-none"
                                    placeholder="Explica diferencias o detalles..."
                                />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Banknote size={14} /> Conteo Físico Real
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <FormInput label="Efectivo en Caja" name="countedCash" form={form} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormInput label="Vouchers Tarjeta" name="countedCard" form={form} />
                                        <FormInput label="Comprobantes Transf." name="countedTransfer" form={form} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seccion Derecha: Cálculos y Resumen */}
                        <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">Declaración vs Sistema</h3>

                            <div className="space-y-3 text-sm">
                                <SummaryRow label="Efectivo (Sistema)" value={totals.calculatedCash} isCurrency />
                                <SummaryRow
                                    label="Diferencia"
                                    value={difference}
                                    isCurrency
                                    highlight
                                    color={Math.abs(difference) < 1 ? 'text-emerald-600' : 'text-rose-600'}
                                />
                            </div>

                            <div className="h-px bg-slate-200 my-4" />

                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <span className="text-slate-500 font-medium">Dejado en Caja (Próximo Inicial)</span>
                                    <span className="text-lg font-bold text-slate-800">{formatCurrency(cashLeft)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02]"
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" size={20} />}
                                Realizar Corte
                            </Button>

                            {Math.abs(difference) > 50 && (
                                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                    <AlertTriangle size={14} className="mt-0.5" />
                                    <span>Hay una diferencia considerable. Asegúrate de justificarla en las notas.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function FormInput({ label, name, form, disabled }: any) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">{label}</label>
            <Input
                {...form.register(name)}
                type="number"
                step="0.01"
                className="bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl font-medium"
                disabled={disabled}
            />
            {form.formState.errors[name] && (
                <span className="text-xs text-rose-500 ml-1 block">{form.formState.errors[name]?.message}</span>
            )}
        </div>
    );
}

function SummaryRow({ label, value, isCurrency, highlight, color }: any) {
    return (
        <div className="flex justify-between items-center p-2 hover:bg-white/50 rounded-lg transition-colors">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className={`font-bold ${color || 'text-slate-700'} ${highlight ? 'text-base' : ''}`}>
                {isCurrency ? formatCurrency(value) : value}
            </span>
        </div>
    );
}
