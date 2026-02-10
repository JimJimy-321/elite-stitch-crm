'use client';

import { useState, useTransition } from 'react';
import { formatCurrency } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, AlertTriangle, FileText, RotateCcw, Loader2, Trash2 } from 'lucide-react';
import { annulCashCut } from '../../actions/cash-cut-actions';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';

interface CashCut {
    id: string;
    branch_id: string;
    date: string;
    manual_cash_amount: number;
    manual_card_amount: number;
    system_total_amount: number;
    discrepancy: number;
    status: string;
    manual_notes: string;
    created_at: string;
    end_date: string;
}

interface CashCutsHistoryProps {
    cuts: CashCut[];
}

export function CashCutsHistory({ cuts }: CashCutsHistoryProps) {
    const [isPending, startTransition] = useTransition();

    const handleAnnul = (cutId: string, branchId: string) => {
        if (!confirm('¿Estás seguro de que deseas anular este corte? Esta acción revertirá la caja al estado anterior.')) return;

        startTransition(async () => {
            const res = await annulCashCut(cutId, branchId);
            if (res.success) {
                toast.success('Corte anulado correctamente');
            } else {
                toast.error('Error al anular corte: ' + res.message);
            }
        });
    };

    if (!cuts || cuts.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-medium">No hay historial de cortes disponible.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4 text-right">Efectivo Real</th>
                        <th className="px-6 py-4 text-right">Teórico</th>
                        <th className="px-6 py-4 text-center">Estado</th>
                        <th className="px-6 py-4">Notas</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {cuts.map((cut, index) => {
                        const discrepancy = cut.manual_cash_amount - cut.system_total_amount;
                        const isBalanced = Math.abs(discrepancy) < 1;
                        const isLatest = index === 0;
                        const canAnnul = isLatest && cut.status === 'active';

                        return (
                            <tr key={cut.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-slate-300" />
                                        <div className="flex flex-col">
                                            <span>{format(new Date(cut.end_date || cut.date), "d 'de' MMMM", { locale: es })}</span>
                                            <span className="text-[10px] text-slate-400">{format(new Date(cut.end_date || cut.date), "h:mm a")}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-800">
                                    {formatCurrency(cut.manual_cash_amount)}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 font-medium">
                                    {formatCurrency(cut.system_total_amount)}
                                </td>
                                <td className="px-6 py-4 flex justify-center">
                                    {cut.status === 'annulled' ? (
                                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-400 flex items-center gap-1">
                                            Anulado
                                        </div>
                                    ) : (
                                        <div className={`
                                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1
                                            ${isBalanced ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
                                        `}>
                                            {isBalanced ? (
                                                <>
                                                    <CheckCircle size={12} />
                                                    Correcto
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle size={12} />
                                                    {formatCurrency(discrepancy)}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-400 italic text-xs max-w-[200px] truncate">
                                    {cut.manual_notes || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {canAnnul && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAnnul(cut.id, cut.branch_id)}
                                            disabled={isPending}
                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs"
                                        >
                                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} className="mr-2" />}
                                            ANULAR
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
