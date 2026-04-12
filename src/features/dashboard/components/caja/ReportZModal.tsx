'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Printer, Loader2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { getReportZData } from '@/features/dashboard/actions/cash-cut-actions';

interface ReportZModalProps {
    cutId: string;
    isOpen: boolean;
    branchName?: string;
    preparedBy?: string;
    onClose: () => void;
}

export function ReportZModal({ cutId, isOpen, branchName, preparedBy, onClose }: ReportZModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && cutId) {
            const loadData = async () => {
                setLoading(true);
                const res = await getReportZData(cutId);
                if (res.success) {
                    setData(res.data);
                }
                setLoading(false);
            };
            loadData();
        }
    }, [isOpen, cutId]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reporte Z Detallado"
            className="max-w-6xl"
        >
            {loading ? (
                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-orange-500" size={40} />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Generando Reporte Z...</p>
                </div>
            ) : data ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Header Info para Impresión */}
                    <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 uppercase">SastrePro - Reporte Z</h1>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sede: {branchName?.toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Generado por: {preparedBy?.toUpperCase()}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase">Fecha: {data?.cut?.end_date ? format(new Date(data.cut.end_date), "dd/MM/yyyy HH:mm") : '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Resumen Superior */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPICard title="Venta Total" value={formatCurrency(Number(data.cut.cash_sales) + Number(data.cut.card_sales) + Number(data.cut.transfer_sales))} color="indigo" />
                        <KPICard title="Efectivo Neto" value={formatCurrency(data.cut.counted_cash)} color="emerald" />
                        <KPICard title="Servicios Realizados" value={data.items.length.toString()} color="orange" />
                    </div>

                    {/* Tabla de Detalle */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">No. Ticket</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Ingreso</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente / Tel.</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo Arreglo</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Precio</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Salida</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Costurera</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.length > 0 ? data.items.map((item: any) => (
                                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-[10px] font-black">
                                                    #{item.ticket.ticket_number}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs font-medium text-slate-600">
                                                {format(new Date(item.ticket.created_at), "dd/MM/yy")}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs font-black text-slate-800 uppercase">{item.ticket.client?.full_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{item.ticket.client?.phone || 'Sin tel.'}</p>
                                            </td>
                                            <td className="p-4 font-medium text-slate-700">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase">{item.garment_name}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase">{item.service_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs font-black text-slate-900">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="p-4 text-xs font-medium text-slate-600">
                                                {format(new Date(item.ticket.delivery_date), "dd/MM/yy")}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                                                    {item.seamstress?.full_name || 'Sin asignar'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                                No se encontraron movimientos en este periodo
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
                            <Printer size={16} className="mr-2" /> Imprimir Vista
                        </Button>
                        <Button className="rounded-xl px-10 bg-slate-900" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-20 text-center text-rose-500 font-bold">Error al cargar datos del reporte.</div>
            )}
        </Modal>
    );
}

function KPICard({ title, value, color }: any) {
    const colors: any = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100"
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} shadow-sm`}>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">{title}</p>
            <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
    );
}
