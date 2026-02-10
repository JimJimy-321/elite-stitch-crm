'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Printer } from 'lucide-react';

import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
// Separator not available, use hr

interface CashCutDetailModalProps {
    cut: any;
    isOpen: boolean;
    onClose: () => void;
}

export function CashCutDetailModal({ cut, isOpen, onClose }: CashCutDetailModalProps) {
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
                        <Button variant="outline" className="h-8 text-xs rounded-lg" onClick={() => window.print()}>
                            <Printer size={14} className="mr-2" />
                            Imprimir
                        </Button>
                    </div>
                </div>

                {/* Resumen Principal */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <DetailItem label="Sistema" value={cut.calculated_cash} />
                    <DetailItem label="Físico" value={cut.counted_cash} highlight />
                    <DetailItem label="Diferencia" value={cut.difference} color={cut.difference !== 0 ? 'text-rose-600' : 'text-emerald-600'} />
                    <DetailItem label="Retirado" value={cut.cash_withdrawn} />
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
                            <Row label="(+) Inicio/Anterior" value={cut.initial_cash} />
                            <Row label="(+) Ingresos Extra" value={cut.incomes_cash} />
                            <Row label="(-) Gastos Operativos" value={cut.expenses_cash} isNegative />
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
                {cut.notes && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
                        <strong className="block text-xs uppercase opacity-70 mb-1">Notas:</strong>
                        {cut.notes}
                    </div>
                )}

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

function Row({ label, value, bold, isNegative }: any) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className={`text-slate-500 ${bold && 'font-bold text-slate-700'}`}>{label}</span>
            <span className={`font-medium ${bold && 'font-black text-slate-900'} ${isNegative && 'text-rose-500'}`}>
                {isNegative ? '-' : ''}{formatCurrency(Number(value))}
            </span>
        </div>
    );
}
