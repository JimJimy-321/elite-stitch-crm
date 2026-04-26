'use client';

import { useState } from 'react';
import { Loader2, LockOpen } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { reopenDay } from '@/features/dashboard/actions/cash-actions';

interface Props {
    branchId: string;
    date: string;
}

export function ReopenDayModal({ branchId, date }: Props) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onReopen = async () => {
        setIsLoading(true);
        try {
            const res = await reopenDay(branchId, date);
            if (res.success) {
                toast.success('Caja reabierta exitosamente');
                setOpen(false);
            } else {
                toast.error(res.message || 'Error al reabrir caja');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="cursor-pointer px-4 py-2 bg-green-100 text-green-800 rounded-md font-bold border border-green-200 flex items-center gap-2 hover:bg-green-200 transition-colors"
            >
                <LockOpen size={16} />
                <span>Caja Cerrada (Click para Abrir)</span>
            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Reabrir Caja del Día">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Esta acción eliminará el corte actual ({date}) y permitirá registrar nuevos movimientos.
                        <strong> Deberás realizar el corte nuevamente al finalizar.</strong>
                    </p>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={onReopen} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <LockOpen className="mr-2 h-4 w-4" />}
                            Confirmar Re-apertura
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
