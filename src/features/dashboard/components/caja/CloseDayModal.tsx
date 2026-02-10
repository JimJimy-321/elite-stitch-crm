'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Lock } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';

import { closeDay } from '../../actions/cash-actions';

const closeDaySchema = z.object({
    manual_cash_amount: z.coerce.number().min(0, 'El monto no puede ser negativo'),
    manual_card_amount: z.coerce.number().min(0).default(0),
    notes: z.string().optional(),
});

type CloseDayFormValues = z.infer<typeof closeDaySchema>;

interface CloseDayModalProps {
    branchId: string;
    calculatedCash: number;
    date: string;
}

export function CloseDayModal({ branchId, calculatedCash, date }: CloseDayModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<CloseDayFormValues>({
        resolver: zodResolver(closeDaySchema) as any,
        defaultValues: {
            manual_cash_amount: 0,
            manual_card_amount: 0,
            notes: '',
        },
    });

    const onSubmit = async (data: CloseDayFormValues) => {
        if (!confirm('¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer por el encargado.')) return;

        setLoading(true);
        try {
            // Usar la fecha seleccionada pasada como prop
            // const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

            const res = await closeDay({
                branch_id: branchId,
                date: date,
                manual_cash_amount: data.manual_cash_amount,
                manual_card_amount: data.manual_card_amount,
                manual_notes: data.notes || '',
                calculated_cash: calculatedCash,
            });

            if (!res.success) {
                alert(`${res.message}: ${res.error || ''}`);
                return;
            }

            setOpen(false);
            // alert('Caja cerrada correctamente');
        } catch (error) {
            alert('Error al cerrar caja');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const manualCash = watch('manual_cash_amount');
    const difference = manualCash - calculatedCash;

    return (
        <>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpen(true)}>
                <Lock className="h-4 w-4" />
                Realizar Corte
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Cierre de Caja Diario">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Ingresa el efectivo real que tienes en mano. Una vez cerrado, no podrás realizar más movimientos hoy.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Teórico (Sistema):</span>
                            <span className="text-lg font-bold">${calculatedCash.toFixed(2)}</span>
                        </div>

                        {manualCash > 0 && Math.abs(difference) > 1 && (
                            <div className={`text-sm font-medium text-right ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {difference > 0 ? `Sobra: $${difference.toFixed(2)}` : `Falta: $${Math.abs(difference).toFixed(2)}`}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-lg font-medium">Efectivo Real ($)</label>
                            <Input
                                type="number"
                                step="0.50"
                                className="text-xl font-bold h-12 text-right"
                                {...register('manual_cash_amount')}
                            />
                            <p className="text-xs text-muted-foreground">Cuenta billetes y monedas.</p>
                            {errors.manual_cash_amount && <p className="text-sm font-medium text-red-500">{errors.manual_cash_amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notas</label>
                            <Input placeholder="Ej: Faltante justificado..." {...register('notes')} />
                        </div>

                        {Math.abs(difference) > 50 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                                <strong>Diferencia Importante:</strong> Hay una diferencia de ${Math.abs(difference).toFixed(2)}. Verifica tu conteo.
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar Cierre
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
