'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, PlusCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal'; // Usando el Modal existente

import { registerExpense } from '../../actions/cash-actions';

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
}

export function ExpenseModal({ branchId, userId }: ExpenseModalProps) {
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
            const res = await registerExpense({
                branch_id: branchId,
                recorded_by: userId,
                amount: data.amount,
                concept: data.concept,
                category: data.category,
            });

            if (!res.success) {
                alert(res.message); // Reemplazo de toast
                return;
            }

            // alert('Gasto registrado correcto'); // Opcional, mejor no interrumpir tanto
            setOpen(false);
            reset();
        } catch (error) {
            alert('Error al registrar gasto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="destructive" className="gap-2" onClick={() => setOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                Registrar Gasto
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Registrar Salida de Efectivo">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Concepto</label>
                        <Input placeholder="Ej: Comida, Transporte, Insumos..." {...register('concept')} />
                        {errors.concept && <p className="text-sm font-medium text-red-500">{errors.concept.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Monto ($)</label>
                            <Input type="number" step="0.50" placeholder="0.00" {...register('amount')} />
                            {errors.amount && <p className="text-sm font-medium text-red-500">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Categoría</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                {...register('category')}
                            >
                                <option value="operativo">Gasto Operativo</option>
                                <option value="insumos">Insumos</option>
                                <option value="transporte">Transporte</option>
                                <option value="retiro">Retiro de Efectivo</option>
                            </select>
                            {errors.category && <p className="text-sm font-medium text-red-500">{errors.category.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} variant="destructive">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Salida
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
