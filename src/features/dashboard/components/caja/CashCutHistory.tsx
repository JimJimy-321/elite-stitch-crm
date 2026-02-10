'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { formatCurrency, cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';

import { annulCashCut } from '@/features/dashboard/actions/cash-cut-actions';
import { CashCutDetailModal } from './CashCutDetailModal';

export function CashCutsHistory({ cuts }: { cuts: any[] }) {
    const [selectedCut, setSelectedCut] = useState<any | null>(null);
    const [cutToDelete, setCutToDelete] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!cutToDelete) return;

        // Assuming deletions are only allowed for the latest cut
        const latestCutId = cuts[0]?.id;
        if (cutToDelete !== latestCutId) {
            toast.error("Solo se puede eliminar el último corte de caja.");
            return;
        }

        startTransition(async () => {
            const res = await annulCashCut(cutToDelete, cuts[0].branch_id);
            if (res.success) {
                toast.success('Corte anulado correctamente');
                setCutToDelete(null);
            } else {
                toast.error(res.message);
            }
        });
    };

    if (!cuts || cuts.length === 0) {
        return (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p>No hay historial de cortes registrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {cuts.map((cut, index) => {
                const isLatest = index === 0 && cut.status === 'active';

                return (
                    <div
                        key={cut.id}
                        className={cn(
                            "relative group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300",
                            cut.status === 'annulled' && "opacity-60 bg-slate-50 grayscale"
                        )}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                            <Badge variant="outline" className={cn(
                                "border-none px-2.5 py-1 rounded-lg font-bold",
                                cut.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                            )}>
                                {cut.status === 'active' ? 'ACTIVO' : 'ANULADO'}
                            </Badge>
                        </div>

                        {/* Card Header */}
                        <div className="mb-4 pr-16">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-1 bg-slate-100 rounded-md text-slate-500 font-bold text-[10px] tracking-wider">
                                    CC-{cut.cut_number || cut.id.slice(0, 6)}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">
                                {format(new Date(cut.end_date), "dd MMM yyyy, HH:mm", { locale: es })}
                            </h4>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-xl">
                            <MetricRow label="Dejado en Caja" value={cut.cash_left} />
                            <MetricRow label="Retirado" value={cut.cash_withdrawn} />
                            <MetricRow label="Diferencia" value={cut.difference} highlight={cut.difference !== 0} />
                        </div>

                        {/* Actions Footer */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 h-10"
                                onClick={() => setSelectedCut(cut)}
                            >
                                <Eye size={16} className="mr-2" />
                                Detalle
                            </Button>

                            {isLatest && (
                                <Button
                                    variant="ghost"
                                    className="px-3 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-10"
                                    onClick={() => setCutToDelete(cut.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Modal de Detalle */}
            {selectedCut && (
                <CashCutDetailModal
                    cut={selectedCut}
                    isOpen={!!selectedCut}
                    onClose={() => setSelectedCut(null)}
                />
            )}

            {/* Confirmación de Eliminación (Custom Modal) */}
            <Modal
                isOpen={!!cutToDelete}
                onClose={() => setCutToDelete(null)}
                title="¿Anular Corte de Caja?"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-xl border border-rose-100 text-rose-800">
                        <AlertTriangle className="shrink-0" />
                        <p className="text-sm font-medium">Esta acción revertirá el último corte. Las ventas volverán a estar pendientes.</p>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="ghost" onClick={() => setCutToDelete(null)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200"
                            disabled={isPending}
                        >
                            {isPending ? 'Anulando...' : 'Sí, Anular Corte'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function MetricRow({ label, value, highlight }: any) {
    const isNegative = value < 0;
    const colorClass = highlight
        ? (isNegative ? 'text-rose-600' : 'text-emerald-600')
        : 'text-slate-700';

    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium uppercase tracking-wide">{label}</span>
            <span className={`font-bold ${colorClass}`}>
                {formatCurrency(Number(value))}
            </span>
        </div>
    );
}
