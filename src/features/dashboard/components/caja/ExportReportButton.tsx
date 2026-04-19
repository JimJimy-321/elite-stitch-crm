'use client';

import { Button } from '@/shared/components/ui/Button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/shared/lib/utils';
import { CashCutState } from '@/features/dashboard/actions/cash-cut-actions';

interface ExportReportButtonProps {
    date?: string;
    branchName?: string;
    preparedBy?: string;
    cashState?: CashCutState | null;
    // Legacy support
    summary?: any;
    movements?: any;
    className?: string;
    children?: React.ReactNode;
}

export function ExportReportButton({ date, branchName, preparedBy, cashState, summary, movements, className, children }: ExportReportButtonProps) {
    const handleExport = () => {
        const doc = new jsPDF();
        const reportDate = date || new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const displayBranch = branchName || cashState?.transactions?.payments?.[0]?.branch?.name || 'SEDE PRINCIPAL';
        const displayUser = preparedBy || 'ADMINISTRADOR';

        // --- Estilos y Paleta ---
        const colors: Record<string, [number, number, number]> = {
            primary: [249, 115, 22],   // Orange-500
            secondary: [15, 23, 42],   // Slate-900
            success: [16, 185, 129],   // Emerald-500
            card: [59, 130, 246],      // Blue-500
            muted: [100, 116, 139],    // Slate-500
            bg: [248, 250, 252]        // Slate-50
        };

        // --- Fondo y Header ---
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(0, 0, 210, 30, 'F');
 
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('SASTREPRO', 15, 15);
 
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(230, 230, 230);
        doc.text('REPORTE OPERATIVO DE CAJA', 15, 20);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`SEDE: ${displayBranch.toUpperCase()}`, 15, 26);
 
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text(`Emitido: ${reportDate}`, 195, 13, { align: 'right' });
        doc.text(`Generado por: ${displayUser.toUpperCase()}`, 195, 18, { align: 'right' });
 
        // --- Data Source ---
        const data = cashState ? {
            initialCash: cashState.totals.initialCash,
            cashIncome: cashState.totals.cashSales,
            extraIncome: cashState.totals.incomesCash,
            cardIncome: cashState.totals.cardSales,
            transferIncome: cashState.totals.transferSales,
            totalExpenses: cashState.totals.expensesCash,
            cashBalance: cashState.totals.calculatedCash,
            totalSales: cashState.totals.totalSales,
            grossSales: cashState.totals.grossSales,
            totalPending: cashState.totals.totalPending || 0,
            anticipos: cashState.totals.anticipos || 0,
            payments: cashState.transactions.payments,
            expenses: cashState.transactions.expenses,
            items: cashState.transactions.items || []
        } : {
            initialCash: 0,
            cashIncome: summary?.totalCash || 0,
            extraIncome: summary?.totalIncomes || 0,
            cardIncome: summary?.totalCard || 0,
            transferIncome: summary?.totalTransfer || 0,
            totalExpenses: summary?.totalExpenses || 0,
            cashBalance: (summary?.totalCash || 0) + (summary?.totalIncomes || 0) - (summary?.totalExpenses || 0),
            totalSales: (summary?.totalCash || 0) + (summary?.totalCard || 0) + (summary?.totalTransfer || 0),
            grossSales: summary?.totalGross || ((summary?.totalCash || 0) + (summary?.totalCard || 0) + (summary?.totalTransfer || 0)),
            totalPending: summary?.totalPending || 0,
            anticipos: summary?.totalAnticipos || 0,
            payments: summary?.payments || movements?.incomes || [],
            expenses: summary?.expenses || movements?.expenses || [],
            items: summary?.items || movements?.items || []
        };

        const efectivoBruto = data.initialCash + data.cashIncome;
        const totalVentasPagos = efectivoBruto + data.cardIncome + data.transferIncome;

        let yPos = 35;

        // --- RESUMEN: RESULTADO DEL DIA ---
        doc.setFontSize(14);
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('RESULTADO DEL D\u00EDA', 15, yPos);

        // Summary data mapped exactly to UI blocks
        const summaryData = [
            ['VENTA DEL DIA (NOTAS NUEVAS)', formatCurrency(data.grossSales || 0)],
            ['A CUENTA (ANTICIPOS/ABONOS)', formatCurrency(data.anticipos || 0)],
            ['VENTAS REGISTRADAS (TOTAL)', formatCurrency((data.grossSales || 0) + (data.anticipos || 0))],
            ['', ''], // Space
            ['POR COBRAR', formatCurrency(data.totalPending || 0)],
            ['', ''], // Space
            ['EFECTIVO', formatCurrency(efectivoBruto)],
            ['TARJETAS', formatCurrency(data.cardIncome || 0)],
            ['TRANSFERENCIAS', formatCurrency(data.transferIncome || 0)],
            ['TOTAL VENTAS', formatCurrency(totalVentasPagos)],
            ['', ''], // Space
            ['EFECTIVO', formatCurrency(efectivoBruto)],
            ['(-) GASTOS EN EFECTIVO', formatCurrency(data.totalExpenses || 0)],
            ['', ''], // Space
            ['TOTAL EN CAJA', formatCurrency(data.cashBalance || 0)]
        ];

        autoTable(doc, {
            startY: yPos + 4,
            body: summaryData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1.5 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'right', fontStyle: 'bold' }
            },
            headStyles: { fillColor: colors.secondary },
            bodyStyles: { textColor: [30, 30, 30] },
            alternateRowStyles: { fillColor: [255, 255, 255] },
            margin: { left: 15, right: 15 },
            didParseCell: (data) => {
                const label = data.row.cells[0].text[0];
                
                // Highlight rows that are "Headers" or "Totals" in the UI
                const highlightRows = [
                    'VENTA DEL DIA (NOTAS NUEVAS)', 
                    'A CUENTA (ANTICIPOS/ABONOS)',
                    'VENTAS REGISTRADAS (TOTAL)', 
                    'EFECTIVO', 
                    'TOTAL VENTAS', 
                    'TOTAL EN CAJA'
                ];

                if (highlightRows.includes(label)) {
                    data.cell.styles.fillColor = [234, 88, 12]; // Orange-600
                    data.cell.styles.textColor = [255, 255, 255];
                }

                // Transparent for empty rows
                if (!label) {
                    data.cell.styles.fillColor = [255, 255, 255];
                    data.cell.styles.lineWidth = 0;
                }
            }
        });

        yPos = (doc as any).lastAutoTable.finalY + 8;

        // --- SECCION: INGRESOS EN EFECTIVO ---
        const cashPayments = data.payments.filter((p: any) => p.payment_method === 'efectivo' || !p.payment_method);
        if (cashPayments.length > 0 || data.extraIncome > 0) {
            doc.setFontSize(12);
            doc.text('DETALLE DE INGRESOS EN EFECTIVO', 15, yPos);
            
            const cashRows = [
                ...cashPayments.map((p: any) => [
                    p.ticket?.ticket_number || 'S/F',
                    p.ticket?.client?.full_name || 'PARTICULAR',
                    p.payment_type?.toUpperCase() || 'PAGO',
                    formatCurrency(p.amount)
                ]),
                ...data.expenses.filter((e: any) => e.type === 'income').map((e: any) => [
                    'EXTRA',
                    'N/A',
                    e.concept?.toUpperCase() || 'INGRESO EXTRA',
                    formatCurrency(e.amount)
                ]),
                // Total row
                ['', '', 'TOTAL EFECTIVO', formatCurrency(data.cashIncome + data.extraIncome)]
            ];

            autoTable(doc, {
                startY: yPos + 4,
                head: [['Nota', 'Cliente', 'Concepto', 'Monto']],
                body: cashRows,
                headStyles: { fillColor: colors.success, fontSize: 8 },
                styles: { fontSize: 7, cellPadding: 1 },
                columnStyles: { 3: { halign: 'right' } },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                    if (data.row.index === cashRows.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [240, 253, 244];
                    }
                }
            });
            yPos = (doc as any).lastAutoTable.finalY + 4;
        }
 
        // --- SECCION: INGRESOS CON TARJETA ---
        const cardPayments = data.payments.filter((p: any) => p.payment_method === 'tarjeta');
        if (cardPayments.length > 0) {
            doc.setFontSize(10);
            doc.text('DETALLE DE INGRESOS CON TARJETA', 15, yPos);
            
            const cardRows = [
                ...cardPayments.map((p: any) => [
                    p.ticket?.ticket_number || 'S/F',
                    p.ticket?.client?.full_name || 'MOSTRADOR',
                    p.payment_type?.toUpperCase() || 'PAGO',
                    formatCurrency(p.amount)
                ]),
                // Total row
                ['', '', 'TOTAL TARJETA', formatCurrency(data.cardIncome)]
            ];
 
            autoTable(doc, {
                startY: yPos + 4,
                head: [['Nota', 'Cliente', 'Concepto', 'Monto']],
                body: cardRows,
                headStyles: { fillColor: colors.card, fontSize: 8 },
                styles: { fontSize: 7, cellPadding: 1 },
                columnStyles: { 3: { halign: 'right' } },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                    if (data.row.index === cardRows.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [239, 246, 255];
                    }
                }
            });
            yPos = (doc as any).lastAutoTable.finalY + 4;
        }

        // --- SECCION: INGRESOS CON TRANSFERENCIA ---
        const transferPayments = data.payments.filter((p: any) => p.payment_method === 'transferencia');
        if (transferPayments.length > 0) {
            doc.setFontSize(10);
            doc.text('DETALLE DE INGRESOS CON TRANSFERENCIA', 15, yPos);
            
            const transRows = [
                ...transferPayments.map((p: any) => [
                    p.ticket?.ticket_number || 'S/F',
                    p.ticket?.client?.full_name || 'MOSTRADOR',
                    p.payment_type?.toUpperCase() || 'PAGO',
                    formatCurrency(p.amount)
                ]),
                // Total row
                ['', '', 'TOTAL TRANSFERENCIA', formatCurrency(data.transferIncome)]
            ];
 
            autoTable(doc, {
                startY: yPos + 4,
                head: [['Nota', 'Cliente', 'Concepto', 'Monto']],
                body: transRows,
                headStyles: { fillColor: [147, 51, 234], fontSize: 8 }, // purple-600
                styles: { fontSize: 7, cellPadding: 1 },
                columnStyles: { 3: { halign: 'right' } },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                    if (data.row.index === transRows.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [250, 245, 255]; // purple-50
                    }
                }
            });
            yPos = (doc as any).lastAutoTable.finalY + 4;
        }

        // --- SECCION: GASTOS DEL DIA ---
        const actualExpenses = data.expenses.filter((e: any) => e.type === 'expense' || !e.type);
        if (actualExpenses.length > 0) {
            doc.setFontSize(10);
            doc.text('DETALLE DE GASTOS DEL D\u00EDA', 15, yPos);
            
            const expenseRows = [
                ...actualExpenses.map((e: any) => [
                    e.concept?.toUpperCase() || 'GASTO OPERATIVO',
                    formatCurrency(e.amount)
                ]),
                // Total row
                ['TOTAL GASTOS', formatCurrency(data.totalExpenses)]
            ];
 
            autoTable(doc, {
                startY: yPos + 4,
                head: [['Concepto', 'Monto']],
                body: expenseRows,
                headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
                styles: { fontSize: 7, cellPadding: 1 },
                columnStyles: { 1: { halign: 'right' } },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 1) {
                        data.cell.styles.halign = 'right';
                    }
                    if (data.row.index === expenseRows.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [254, 242, 242];
                    }
                }
            });
            yPos = (doc as any).lastAutoTable.finalY + 4;
        }

        // --- SECCION: PRODUCCIÓN DIARIA ---
        if (data.items.length > 0) {
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(10);
            doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            doc.text('PRODUCCI\u00D3N DIARIA (DETALLE DE PRENDAS)', 15, yPos);

            yPos += 4;
            autoTable(doc, {
                startY: yPos,
                head: [['Nota', 'Prenda', 'Servicio', 'Precio', 'Estatus']],
                body: [
                    ...(data.items || []).map((item: any) => [
                        item.ticket?.ticket_number || '-',
                        item.garment_name?.toUpperCase() || '-',
                        item.service_name?.toUpperCase() || '-',
                        formatCurrency(item.price || 0),
                        item.status === 'finished' ? 'LISTO' : 'PENDIENTE'
                    ]),
                    [
                        { content: 'TOTAL PRODUCCI\u00D3N', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
                        { content: formatCurrency((data.items || []).reduce((sum: number, i: any) => sum + Number(i.price || 0), 0)), styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
                        { content: '', styles: { fillColor: [245, 245, 245] } }
                    ]
                ],
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22], fontSize: 8, halign: 'center' },
                bodyStyles: { fontSize: 7, halign: 'center' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                margin: { left: 14, right: 14 },
            });
            yPos = (doc as any).lastAutoTable.finalY + 4;
        }

        // --- Pie de Página ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
            doc.text(
                `SastrePro Elite v3.0 - Automatizaci\u00F3n de Talleres de Costura`,
                105,
                285,
                { align: 'center' }
            );
            doc.text(`P\u00E1gina ${i} de ${pageCount}`, 195, 285, { align: 'right' });
        }

        doc.save(`Reporte_SastrePro_${new Date().getTime()}.pdf`);
    };

    return (
        <Button
            onClick={handleExport}
            variant="outline"
            disabled={!cashState && !summary}
            className={className || "text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm"}
        >
            {children || (
                <>
                    <Download size={14} className="mr-2" />
                    Exportar Reporte
                </>
            )}
        </Button>
    );
}
