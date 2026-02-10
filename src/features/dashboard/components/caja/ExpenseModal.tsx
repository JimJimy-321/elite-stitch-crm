'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, PlusCircle, Banknote, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';

import { registerMovement } from '../../actions/cash-cut-actions';

// Schema de validación
const expenseSchema = z.object({
    concept: z.string().min(3, 'El concepto es muy corto'),
    amount: z.coerce.number().min(1, 'El monto debe ser mayor a 0'),
    category: z.string().min(1, 'Selecciona una categoría'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
    branchId: string;
    userId: string;
    disabled?: boolean;
}

export function ExpenseModal({ branchId, userId, disabled }: ExpenseModalProps) {
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
                concept: data.concept,
                category: data.category,
                type: 'expense', // Always expense/withdrawal here
            });

            if (!res.success) {
                toast.error(res.message);
                return;
            }

            toast.success('Movimiento registrado correctamente');
            setOpen(false);
            reset();
        } catch (error) {
            toast.error('Error al registrar movimiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="gap-2 bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 hover:text-rose-700 h-10 px-4 rounded-xl font-bold shadow-sm"
                onClick={() => setOpen(true)}
                disabled={disabled}
            >
                <PlusCircle className="h-4 w-4" />
                Registrar Gasto / Retiro
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Registrar Salida de Efectivo">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
                        <Banknote className="text-rose-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-rose-700">Salida de Dinero</p>
                            <p className="text-xs text-rose-600 mt-1">
                                Este movimiento restará del efectivo en caja actual. Úsalo para compras de insumos, pagos de servicios o retiros.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Concepto</label>
                            <Input
                                placeholder="Ej: Compra de hilos, Pago de luz, Retiro del dueño..."
                                {...register('concept')}
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                            {errors.concept && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle size={10} /> {errors.concept.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Monto ($)</label>
                                <Input
                                    type="number"
                                    step="0.50"
                                    placeholder="0.00"
                                    {...register('amount')}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors font-bold text-lg"
                                />
                                {errors.amount && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle size={10} /> {errors.amount.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Categoría</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                                    {...register('category')}
                                >
                                    <option value="operativo">Gasto Operativo</option>
                                    <option value="insumos">Insumos</option>
                                    <option value="transporte">Transporte</option>
                                    <option value="retiro">Retiro de Efectivo</option>
                                </select>
                                {errors.category && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle size={10} /> {errors.category.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200 font-bold"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Salida
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
