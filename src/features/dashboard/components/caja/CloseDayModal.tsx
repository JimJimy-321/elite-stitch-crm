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
    manual_cash_amount: z.coerce.number().min(0, 'EL MONTO NO PUEDE SER NEGATIVO'),
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
        if (!confirm('\u00BFEST\u00C1S SEGURO DE CERRAR LA CAJA? ESTA ACCI\u00D3N NO SE PUEDE DESHACER POR EL ENCARGADO.')) return;

        setLoading(true);
        try {
            const res = await closeDay({
                branch_id: branchId,
                date: date,
                manual_cash_amount: data.manual_cash_amount,
                manual_card_amount: data.manual_card_amount,
                manual_notes: data.notes || '',
                calculated_cash: calculatedCash,
            });

            if (!res.success) {
                alert(`${(res.message || 'ERROR').toUpperCase()}: ${res.error || ''}`);
                return;
            }

            setOpen(false);
        } catch (error) {
            alert('ERROR AL CERRAR CAJA');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const manualCash = watch('manual_cash_amount');
    const difference = manualCash - calculatedCash;

    return (
        <>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest" onClick={() => setOpen(true)}>
                <Lock className="h-4 w-4" />
                REALIZAR CORTE
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="CIERRE DE CAJA DIARIO">
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">
                        INGRESA EL EFECTIVO REAL QUE TIENES EN MANO. UNA VEZ CERRADO, NO PODR\u00c1S REALIZAR M\u00c1S MOVIMIENTOS HOY.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">TE\u00F3RICO (SISTEMA):</span>
                            <span className="text-lg font-bold">${calculatedCash.toFixed(2)}</span>
                        </div>

                        {manualCash > 0 && Math.abs(difference) > 1 && (
                            <div className={`text-[10px] font-black uppercase tracking-widest text-right ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {difference > 0 ? `SOBRA: $${difference.toFixed(2)}` : `FALTA: $${Math.abs(difference).toFixed(2)}`}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest">EFECTIVO REAL ($)</label>
                            <Input
                                type="number"
                                step="0.50"
                                className="text-xl font-bold h-12 text-right"
                                {...register('manual_cash_amount')}
                            />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">CUENTA BILLETES Y MONEDAS.</p>
                            {errors.manual_cash_amount && <p className="text-[10px] font-black text-red-500 uppercase">{errors.manual_cash_amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest">NOTAS</label>
                            <Input placeholder="EJ: FALTANTE JUSTIFICADO..." {...register('notes')} className="uppercase" />
                        </div>

                        {Math.abs(difference) > 50 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-[10px] font-black uppercase leading-tight">
                                <strong>DIFERENCIA IMPORTANTE:</strong> HAY UNA DIFERENCIA DE ${Math.abs(difference).toFixed(2)}. VERIFICA TU CONTEO.
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-[10px] font-black uppercase tracking-widest px-6">
                                CANCELAR
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-6">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                CONFIRMAR CIERRE
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
