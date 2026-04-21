'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Banknote, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';

import { registerMovement } from '../../actions/cash-cut-actions';

// Schema de validación
const expenseSchema = z.object({
    concept: z.string().min(3, 'EL CONCEPTO ES MUY CORTO'),
    amount: z.coerce.number().min(1, 'EL MONTO DEBE SER MAYOR A 0'),
    category: z.string().min(1, 'SELECCIONA UNA CATEGOR\u00CDA'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
    branchId: string;
    userId: string;
    disabled?: boolean;
}

export function ExpenseModal({ branchId, userId, disabled }: ExpenseModalProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            concept: '',
            amount: 0,
            category: 'operativo',
        },
    });

    const onSubmit = async (data: ExpenseFormValues) => {
        setLoading(true);
        try {
            const res = await registerMovement({
                branch_id: branchId,
                recorded_by: userId,
                amount: data.amount,
                concept: data.concept.toUpperCase(),
                category: data.category,
                type: 'expense', // Always expense/withdrawal here
            });

            if (!res.success) {
                toast.error(res.message);
                return;
            }

            toast.success('MOVIMIENTO REGISTRADO CORRECTAMENTE');
            setOpen(false);
            reset();

            // Notificar a otros componentes y refrescar servidor
            window.dispatchEvent(new CustomEvent('cash-cut-refresh'));
            router.refresh();
        } catch (error) {
            toast.error('ERROR AL REGISTRAR MOVIMIENTO');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="gap-2 bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 hover:text-rose-700 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm"
                onClick={() => setOpen(true)}
                disabled={disabled}
            >
                <PlusCircle className="h-4 w-4" />
                REGISTRAR GASTO / RETIRO
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="REGISTRAR SALIDA DE EFECTIVO">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
                        <Banknote className="text-rose-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">SALIDA DE DINERO</p>
                            <p className="text-[10px] font-bold text-rose-600 mt-1 uppercase leading-tight">
                                ESTE MOVIMIENTO RESTAR\u00C1 DEL EFECTIVO EN CAJA ACTUAL. \u00DASALO PARA COMPRAS DE INSUMOS, PAGOS DE SERVICIOS O RETIROS.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">CONCEPTO</label>
                            <Input
                                placeholder="EJ: COMPRA DE HILOS, PAGO DE LUZ, RETIRO DEL DUE\u00D1O..."
                                {...register('concept')}
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors uppercase font-bold"
                            />
                            {errors.concept && <p className="text-[9px] font-black text-rose-500 flex items-center gap-1 uppercase"><AlertCircle size={10} /> {errors.concept.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">MONTO ($)</label>
                                <Input
                                    type="number"
                                    step="0.50"
                                    placeholder="0.00"
                                    {...register('amount')}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors font-bold text-lg"
                                />
                                {errors.amount && <p className="text-[9px] font-black text-rose-500 flex items-center gap-1 uppercase"><AlertCircle size={10} /> {errors.amount.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">CATEGOR\u00CDA</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors focus-visible:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                                    {...register('category')}
                                >
                                    <option value="operativo">GASTO OPERATIVO</option>
                                    <option value="insumos">INSUMOS</option>
                                    <option value="transporte">TRANSPORTE</option>
                                    <option value="retiro">RETIRO DE EFECTIVO</option>
                                </select>
                                {errors.category && <p className="text-[9px] font-black text-rose-500 flex items-center gap-1 uppercase"><AlertCircle size={10} /> {errors.category.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl text-[10px] font-black uppercase tracking-widest">
                            CANCELAR
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200 font-black text-[10px] uppercase tracking-widest px-6"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            REGISTRAR SALIDA
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
