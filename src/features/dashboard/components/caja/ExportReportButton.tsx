'use client';

import { Button } from '@/shared/components/ui/Button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/shared/lib/utils';
import { CashCutState } from '@/features/dashboard/actions/cash-cut-actions';

interface ExportReportButtonProps {
    date?: string;
    cashState?: CashCutState | null;
    // Legacy support
    summary?: any;
    movements?: any;
}

export function ExportReportButton({ date, cashState, summary, movements }: ExportReportButtonProps) {
    const handleExport = () => {
        const doc = new jsPDF();
        const reportDate = date || new Date().toLocaleDateString('es-MX');

        // Header
        doc.setFontSize(20);
        doc.setTextColor(249, 115, 22); // Orange in RGB
        doc.text('SastrePro - Corte Parcial', 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Fecha: ${reportDate}`, 14, 32);

        // Data Source
        const data = cashState ? {
            cashIncome: cashState.totals.cashSales + cashState.totals.incomesCash,
            cardIncome: cashState.totals.cardSales,
            transferIncome: cashState.totals.transferSales,
            totalExpenses: cashState.totals.expensesCash,
            cashBalance: cashState.totals.calculatedCash,
            monthlyTotal: 0, // Not available in this context yet
            incomes: cashState.transactions.payments.map((p: any) => ({
                created_at: p.created_at,
                payment_type: 'Venta',
                payment_method: p.payment_method,
                amount: p.amount,
                notes: `Ticket #${p.ticket_id}`
            })).concat(cashState.transactions.expenses.filter((e: any) => e.type === 'income').map((e: any) => ({
                created_at: e.created_at,
                payment_type: 'Ingreso',
                payment_method: 'Efectivo',
                amount: e.amount,
                notes: e.concept
            }))),
            expenses: cashState.transactions.expenses.filter((e: any) => e.type === 'expense' || !e.type)
        } : {
            cashIncome: summary?.cashIncome || 0,
            cardIncome: summary?.cardIncome || 0,
            transferIncome: summary?.transferIncome || 0,
            totalExpenses: summary?.totalExpenses || 0,
            cashBalance: summary?.cashBalance || 0,
            monthlyTotal: summary?.monthlyTotal || 0,
            incomes: movements?.incomes || [],
            expenses: movements?.expenses || []
        };

        // Summary Section
        doc.setFillColor(245, 245, 245);
        doc.rect(14, 40, 182, 35, 'F');

        doc.setFontSize(14);
        doc.text('Resumen del Periodo', 14, 48);

        doc.setFontSize(10);
        doc.text(`Ventas Efectivo: ${formatCurrency(data.cashIncome)}`, 20, 58);
        doc.text(`Ventas Tarjeta: ${formatCurrency(data.cardIncome)}`, 20, 64);
        doc.text(`Transferencias: ${formatCurrency(data.transferIncome)}`, 20, 70);

        doc.text(`Gastos/Retiros: ${formatCurrency(data.totalExpenses)}`, 110, 58);
        doc.text(`Efectivo Calculado: ${formatCurrency(data.cashBalance)}`, 110, 64);

        // Movements Table
        const rows = [
            ...data.incomes.map((m: any) => [
                new Date(m.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                m.notes || m.payment_type, // Concept
                m.payment_method || 'N/A',
                `+${formatCurrency(m.amount)}`,
            ]),
            ...data.expenses.map((e: any) => [
                new Date(e.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                e.concept || 'Gasto',
                'Efectivo',
                `-${formatCurrency(e.amount)}`,
            ])
        ].sort((a, b) => (a[0] < b[0] ? 1 : -1));

        autoTable(doc, {
            startY: 85,
            head: [['Hora', 'Concepto', 'Método', 'Monto']],
            body: rows,
            headStyles: { fillColor: [249, 115, 22] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { top: 85 },
        });

        doc.save(`Corte_Parcial_${new Date().getTime()}.pdf`);
    };

    return (
        <Button
            onClick={handleExport}
            variant="outline"
            disabled={!cashState && !summary}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm"
        >
            <Download size={14} className="mr-2" />
            Exportar Reporte
        </Button>
    );
}
