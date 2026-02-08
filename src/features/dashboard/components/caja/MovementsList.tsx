'use client';

import { Badge } from '@/shared/components/ui/Badge';

interface MovementsListProps {
    incomes: any[];
    expenses: any[];
}

export function MovementsList({ incomes, expenses }: MovementsListProps) {
    // Unificar y ordenar por fecha descendente
    const allMovements = [
        ...incomes.map((i) => ({ ...i, type: 'income' })),
        ...expenses.map((e) => ({ ...e, type: 'expense' })),
    ].sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="rounded-md border bg-white overflow-hidden border-slate-100">
            <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-100">
                            <th className="h-12 px-4 align-middle font-medium text-slate-500 uppercase text-[10px] tracking-widest">Hora</th>
                            <th className="h-12 px-4 align-middle font-medium text-slate-500 uppercase text-[10px] tracking-widest">Concepto</th>
                            <th className="h-12 px-4 align-middle font-medium text-slate-500 uppercase text-[10px] tracking-widest">Método</th>
                            <th className="h-12 px-4 align-middle font-medium text-slate-500 uppercase text-[10px] tracking-widest text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {allMovements.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 align-middle h-24 text-center text-slate-400 font-medium">
                                    No hay movimientos hoy.
                                </td>
                            </tr>
                        ) : (
                            allMovements.map((mov) => (
                                <tr key={mov.id} className="border-b transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100">
                                    <td className="p-4 align-middle font-bold text-slate-700 text-xs">
                                        {formatTime(mov.created_at)}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-xs">
                                                {mov.type === 'income'
                                                    ? mov.payment_type ? `Pago (${mov.payment_type})` : 'Ingreso'
                                                    : mov.concept || 'Gasto'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                                                {mov.type === 'income'
                                                    ? (mov.notes || 'Sin notas')
                                                    : (mov.category || 'Operativo')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {mov.type === 'income' ? (
                                            <div className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider inline-block">
                                                {mov.payment_method}
                                            </div>
                                        ) : (
                                            <div className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider inline-block">Efectivo</div>
                                        )}
                                    </td>
                                    <td className={`p-4 align-middle text-right font-black ${mov.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                                        }`}>
                                        {mov.type === 'income' ? '+' : '-'}{Number(mov.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
