'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { registerExpense } from '@/features/dashboard/actions/cash-actions';

const schema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'El monto debe ser mayor a 0',
    }),
});

interface Props {
    branchId: string;
    userId: string;
    date?: string;
}

export function InitialCashModal({ branchId, userId, date }: Props) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const res = await registerExpense({
                branch_id: branchId,
                amount: Number(data.amount),
                concept: 'Fondo Inicial de Caja',
                category: 'Fondo de Caja',
                recorded_by: userId,
                type: 'income',
                date: date,
            });

            if (res.success) {
                toast.success('Fondo inicial registrado');
                setOpen(false);
                reset();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Error al registrar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="gap-2 border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200"
                onClick={() => setOpen(true)}
            >
                <DollarSign size={16} />
                Fondo Inicial
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Establecer Fondo Inicial">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-700 text-sm mb-4">
                        Ingresa el efectivo con el que inicias operaciones (cambio, monedas, etc). Esto sumará al efectivo en caja.
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="amount" className="text-sm font-medium text-slate-700">Monto ($)</label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.50"
                            className="text-2xl font-bold h-14 text-right"
                            placeholder="0.00"
                            {...register('amount')}
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-xs">{(errors as any).amount.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white hover:bg-slate-800">
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Registrar Apertura'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
