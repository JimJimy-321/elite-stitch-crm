'use client';

import { Button } from '@/shared/components/ui/Button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/shared/lib/utils';

interface ExportReportButtonProps {
    date: string;
    summary: {
        cashIncome: number;
        cardIncome: number;
        transferIncome: number;
        totalExpenses: number;
        cashBalance: number;
        monthlyTotal: number;
    };
    movements: {
        incomes: any[];
        expenses: any[];
    };
}

export function ExportReportButton({ date, summary, movements }: ExportReportButtonProps) {
    const handleExport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(249, 115, 22); // Orange in RGB
        doc.text('SastrePro - Reporte Financiero', 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString('es-MX')}`, 14, 32);

        // Summary Section
        doc.setFillColor(245, 245, 245);
        doc.rect(14, 40, 182, 35, 'F');

        doc.setFontSize(14);
        doc.text('Resumen del Día', 14, 48);

        doc.setFontSize(10);
        doc.text(`Ingresos Efectivo: ${formatCurrency(summary.cashIncome)}`, 20, 58);
        doc.text(`Ingresos Tarjeta: ${formatCurrency(summary.cardIncome)}`, 20, 64);
        doc.text(`Transferencias: ${formatCurrency(summary.transferIncome)}`, 20, 70);

        doc.text(`Gastos Totales: ${formatCurrency(summary.totalExpenses)}`, 110, 58);
        doc.text(`Efectivo en Caja: ${formatCurrency(summary.cashBalance)}`, 110, 64);
        doc.text(`Acumulado Mes: ${formatCurrency(summary.monthlyTotal)}`, 110, 70);

        // Movements Table
        const rows = [
            ...movements.incomes.map(m => [
                new Date(m.created_at).toLocaleTimeString('es-MX'),
                m.payment_type ? `Pago (${m.payment_type})` : 'Ingreso',
                m.payment_method || 'N/A',
                `+${formatCurrency(m.amount)}`,
                m.notes || ''
            ]),
            ...movements.expenses.map(e => [
                new Date(e.created_at).toLocaleTimeString('es-MX'),
                e.concept || 'Gasto',
                'Efectivo',
                `-${formatCurrency(e.amount)}`,
                e.category || ''
            ])
        ].sort((a, b) => (a[0] < b[0] ? 1 : -1)); // Simple sort by time string (approx)

        autoTable(doc, {
            startY: 85,
            head: [['Hora', 'Concepto', 'Método', 'Monto', 'Notas']],
            body: rows,
            headStyles: { fillColor: [249, 115, 22] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { top: 85 },
        });

        doc.save(`Corte_Caja_${date}.pdf`);
    };

    return (
        <Button
            onClick={handleExport}
            variant="outline"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm"
        >
            <Download size={14} className="mr-2" />
            Exportar Reporte
        </Button>
    );
}
