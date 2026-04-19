'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Printer, FileText } from 'lucide-react';

import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
// Separator not available, use hr

import { getReportZData } from '@/features/dashboard/actions/cash-cut-actions';
import { ReportZModal } from './ReportZModal';
import { ExportReportButton } from './ExportReportButton';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranches } from '@/features/dashboard/hooks/useDashboardData';

interface CashCutDetailModalProps {
    cut: any;
    isOpen: boolean;
    onClose: () => void;
}

export function CashCutDetailModal({ cut, isOpen, onClose }: CashCutDetailModalProps) {
    const { user } = useAuthStore();
    const { branches } = useBranches();
    const [isReportZOpen, setIsReportZOpen] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [fullData, setFullData] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const branchName = branches?.find(b => b.id === cut?.branch_id)?.name || 'Sede';

    React.useEffect(() => {
        if (isOpen && cut?.id) {
            const loadData = async () => {
                setIsLoadingData(true);
                const res = await getReportZData(cut.id, Date.now());
                if (res.success && res.data) {
                    setFullData(res.data);
                    setReportData(res.data.items || []);
                }
                setIsLoadingData(false);
            };
            loadData();
        }
    }, [isOpen, cut?.id]);

    if (!cut) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalle de Corte de Caja"
            className="max-w-3xl"
        >
            <div className="space-y-6">

                {/* Header Info */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <p className="text-slate-500 font-medium">
                        Fecha: <span className="text-slate-900 font-bold">{format(new Date(cut.end_date), "dd 'de' MMMM, yyyy • HH:mm", { locale: es })}</span>
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            onClick={() => setIsReportZOpen(true)}
                        >
                            <FileText size={14} className="mr-2" />
                            Ver Reporte Z
                        </Button>
                        <ExportReportButton
                            date={format(new Date(cut.end_date), "dd 'de' MMMM, yyyy • HH:mm", { locale: es })}
                            branchName={branchName}
                            preparedBy={user?.full_name}
                            summary={isLoadingData || !fullData ? null : {
                                totalGross: Number(cut.gross_sales || 0),
                                totalAnticipos: Number(cut.anticipos || 0),
                                totalPending: Number(cut.total_pending || 0),
                                totalCash: Number(cut.cash_sales),
                                totalIncomes: Number(cut.incomes_cash),
                                totalCard: Number(cut.card_sales),
                                totalTransfer: Number(cut.transfer_sales),
                                totalExpenses: Number(cut.expenses_cash),
                                items: fullData.items || [],
                                payments: fullData.payments || [],
                                expenses: fullData.expenses || []
                            }}
                            className="h-8 text-[12px] font-black uppercase tracking-wide rounded-lg px-4 border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                        >
                            <Printer size={14} className="mr-2" />
                            Imprimir
                        </ExportReportButton>
                    </div>
                </div>

                <ReportZModal
                    cutId={cut.id}
                    isOpen={isReportZOpen}
                    branchName={branchName}
                    preparedBy={user?.full_name}
                    onClose={() => setIsReportZOpen(false)}
                />

                {/* Resumen Principal */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <DetailItem label="Sistema" value={cut.calculated_cash} />
                    <DetailItem label="F\u00EDsico" value={cut.counted_cash} highlight />
                    <DetailItem label="Diferencia" value={cut.difference} color={cut.difference !== 0 ? 'text-rose-600' : 'text-emerald-600'} />
                    <DetailItem label="Retirado" value={cut.cash_withdrawn} />
                </div>

                {/* Resultado del Día (Unificado con pantalla de cierre) */}
                <div className="p-5 bg-orange-50/30 rounded-2xl border border-orange-100">
                    <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1 h-3 bg-orange-500 rounded-full" />
                        Resultado del Día
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        <Row label="Venta del D\u00EDa" value={cut.gross_sales || 0} bold />
                        <Row label="A Cuenta (Anticipos)" value={cut.anticipos || 0} />
                        <Row label="Ventas Registradas" value={cut.gross_sales || 0} bold color="text-indigo-600" />
                        <Row label="Por Cobrar" value={cut.total_pending || 0} isNegative />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Desglose de Ventas */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                            Ingresos por Ventas
                        </h3>
                        <div className="space-y-2">
                            <Row label="Efectivo" value={cut.cash_sales} />
                            <Row label="Tarjeta" value={cut.card_sales} />
                            <Row label="Transferencia" value={cut.transfer_sales} />
                            <hr className="border-slate-100 my-2" />
                            <Row label="Total Ventas" value={Number(cut.cash_sales) + Number(cut.card_sales) + Number(cut.transfer_sales)} bold />
                        </div>
                    </div>

                    {/* Movimientos de Caja */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                            Flujo de Efectivo
                        </h3>
                        <div className="space-y-2">
                            <Row label="(+) Efectivo del d\u00EDa" value={cut.cash_sales} />
                            <Row label="(+) Inicio/Anterior" value={cut.initial_cash} />
                            {Number(cut.incomes_cash) > 0 && <Row label="(+) Ingresos Extra" value={cut.incomes_cash} />}
                            <Row label="(-) Gastos Operativos" value={cut.expenses_cash} isNegative />
                            <hr className="border-slate-100 my-2" />
                            <Row label="TOTAL EN CAJA" value={cut.calculated_cash} bold />
                        </div>
                    </div>
                </div>

                {/* Balance Final */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center shadow-lg shadow-slate-200">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Efectivo dejado para siguiente turno</p>
                        <p className="text-xs text-slate-500">Contado - Retirado</p>
                    </div>
                    <div className="text-2xl font-black tracking-tighter">
                        {formatCurrency(cut.cash_left)}
                    </div>
                </div>

                {/* Notas */}
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
                    <strong className="block text-xs uppercase opacity-70 mb-1">Observaciones / Notas:</strong>
                    {cut.notes || cut.manual_notes ? (
                        <span>{cut.notes || cut.manual_notes}</span>
                    ) : (
                        <span className="opacity-70 italic">No se registraron observaciones.</span>
                    )}
                </div>

                {/* Detalle de Servicios (Reporte Z integrado para impresión) */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} className="text-orange-500" />
                        Detalle de Servicios del Turno
                    </h3>

                    {isLoadingData ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                    ) : reportData.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                            <table className="w-full text-[10px] text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Ticket</th>
                                        <th className="px-4 py-3">Cliente</th>
                                        <th className="px-4 py-3">Prenda/Servicio</th>
                                        <th className="px-4 py-3">Costurera</th>
                                        <th className="px-4 py-3 text-right">Precio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {reportData.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-slate-700">#{item.ticket?.ticket_number}</td>
                                            <td className="px-4 py-3">{item.ticket?.client?.full_name}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-slate-800">{item.garment_name}</span>
                                                <br />
                                                <span className="text-slate-400 font-normal">{item.service_name}</span>
                                            </td>
                                            <td className="px-4 py-3 uppercase font-medium text-indigo-600">{item.seamstress?.full_name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-right font-black text-slate-900">{formatCurrency(item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center">
                            <p className="text-slate-400 font-medium text-xs">No hay servicios registrados en este periodo.</p>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <Button onClick={onClose} className="rounded-xl px-8">
                        Cerrar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

function DetailItem({ label, value, highlight, color }: any) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className={`font-black tracking-tight text-lg ${color || 'text-slate-900'} ${highlight && 'bg-yellow-100 px-1 -mx-1 rounded-md inline-block'}`}>
                {formatCurrency(Number(value))}
            </p>
        </div>
    );
}

function Row({ label, value, bold, isNegative, color }: any) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className={`text-slate-500 ${bold && 'font-bold text-slate-700'}`}>{label}</span>
            <span className={`font-medium ${bold && !color && 'font-black text-slate-900'} ${color || ''} ${isNegative && 'text-rose-500'}`}>
                {isNegative ? '-' : ''}{formatCurrency(Number(value))}
            </span>
        </div>
    );
}
