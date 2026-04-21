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
        message: 'EL MONTO DEBE SER MAYOR A 0',
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
                concept: 'FONDO INICIAL DE CAJA',
                category: 'FONDO DE CAJA',
                recorded_by: userId,
                type: 'income',
                date: date,
            });

            if (res.success) {
                toast.success('FONDO INICIAL REGISTRADO');
                setOpen(false);
                reset();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('ERROR AL REGISTRAR');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="gap-2 border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-orange-600 hover:border-orange-200"
                onClick={() => setOpen(true)}
            >
                <DollarSign size={16} />
                FONDO INICIAL
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="ESTABLECER FONDO INICIAL">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-700 text-[10px] font-black uppercase tracking-tight mb-4">
                        INGRESA EL EFECTIVO CON EL QUE INICIAS OPERACIONES (CAMBIO, MONEDAS, ETC). ESTO SUMAR\u00C1 AL EFECTIVO EN CAJA.
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">MONTO ($)</label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.50"
                            className="text-2xl font-bold h-14 text-right"
                            placeholder="0.00"
                            {...register('amount')}
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-[10px] font-black uppercase">{(errors as any).amount.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading} className="text-[10px] font-black uppercase tracking-widest">
                            CANCELAR
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-6">
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'REGISTRAR APERTURA'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
