'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipos de respuesta
export type ActionResponse<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
    error?: any;
};

// ----------------------------------------------------------------------
// 1. Obtener Resumen de Caja (Cash Flow)
// ----------------------------------------------------------------------
export async function getDailyCashSummary(branchId: string, date: string): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // A. Obtener Pagos (Ingresos) del día en esa sucursal
        // FIX: Ajustar rango a Zona Horaria México (UTC-6)
        // El día comienza a las 06:00 UTC del día actual y termina a las 06:00 UTC del día siguiente
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        const startOfDay = `${date}T06:00:00.000Z`;
        const endOfDay = `${nextDay.toISOString().split('T')[0]}T06:00:00.000Z`;

        const { data: payments, error: paymentsError } = await supabase
            .from('ticket_payments')
            .select('*')
            .eq('branch_id', branchId)
            .gte('created_at', startOfDay)
            .lt('created_at', endOfDay) // Usamos lt para no incluir el segundo exacto
            .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;

        // B. Obtener Gastos (Egresos) del día
        const { data: expenses, error: expensesError } = await supabase
            .from('expenses')
            .select('*')
            .eq('branch_id', branchId)
            .gte('created_at', startOfDay)
            .lt('created_at', endOfDay)
            .order('created_at', { ascending: false });

        if (expensesError) throw expensesError;

        // C. Calcular Totales en Servidor
        const cashIncome = payments
            ?.filter((p) => p.payment_method === 'efectivo')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const cardIncome = payments
            ?.filter((p) => p.payment_method === 'tarjeta')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const transferIncome = payments
            ?.filter((p) => p.payment_method === 'transferencia')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const totalExpenses = expenses
            ?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

        // D. Obtener Saldo Inicial (Corte Anterior)
        // Buscamos el corte más reciente anterior a hoy
        const { data: lastCut } = await supabase
            .from('daily_reconciliations')
            .select('manual_cash_amount')
            .eq('branch_id', branchId)
            .lt('date', date)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();

        const openingBalance = lastCut?.manual_cash_amount || 0;

        const cashBalance = (openingBalance + cashIncome) - totalExpenses;

        // D. Verificar si ya existe corte
        const { data: reconciliation } = await supabase
            .from('daily_reconciliations')
            .select('*')
            .eq('branch_id', branchId)
            .eq('date', date)
            .maybeSingle();

        // E. Calcular Meta Mensual (Mes actual)
        // Usamos el primer día del mes actual en UTC (06:00 UTC = 00:00 CST)
        const [year, month] = date.split('-');
        const startOfMonth = `${year}-${month}-01T06:00:00.000Z`;

        // Ingresos del mes
        const { data: monthlyPayments } = await supabase
            .from('ticket_payments')
            .select('amount')
            .eq('branch_id', branchId)
            .eq('branch_id', branchId)
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfDay);

        const monthlyTotal = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;


        return {
            success: true,
            data: {
                movements: {
                    incomes: payments || [],
                    expenses: expenses || [],
                },
                summary: {
                    cashIncome,
                    cardIncome,
                    transferIncome,
                    totalExpenses,
                    openingBalance, // Nuevo campo
                    cashBalance, // Efectivo Teórico en Caja
                    monthlyTotal, // Nuevo campo para KPI de meta
                },
                reconciliation: reconciliation || null,
                isClosed: !!reconciliation,
            },
        };
    } catch (error: any) {
        console.error('Error in getDailyCashSummary:', error);
        return { success: false, message: 'Error al obtener resumen de caja', error: error.message };
    }
}

// ----------------------------------------------------------------------
// 2. Registrar Gasto
// ----------------------------------------------------------------------
export async function registerExpense(data: {
    branch_id: string;
    amount: number;
    concept: string;
    category: string;
    recorded_by: string;
}): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // Validar si la caja ya está cerrada
        const today = new Date().toISOString().split('T')[0];
        const { data: existingClose } = await supabase
            .from('daily_reconciliations')
            .select('id')
            .eq('branch_id', data.branch_id)
            .eq('date', today)
            .maybeSingle();

        if (existingClose) {
            return { success: false, message: 'La caja de hoy ya está cerrada. No se pueden registrar más gastos.' };
        }

        const { error } = await supabase.from('expenses').insert([{
            branch_id: data.branch_id,
            amount: data.amount,
            concept: data.concept,
            category: data.category,
            recorded_by: data.recorded_by,
        }]);

        if (error) throw error;

        revalidatePath('/dashboard/finance');
        return { success: true, message: 'Gasto registrado correctamente' };
    } catch (error: any) {
        console.error('Error in registerExpense:', error);
        return { success: false, message: 'Error al registrar gasto', error: error.message };
    }
}

// ----------------------------------------------------------------------
// 3. Cerrar Caja (Daily Close)
// ----------------------------------------------------------------------
export async function closeDay(data: {
    branch_id: string;
    date: string; // YYYY-MM-DD
    manual_cash_amount: number;
    manual_card_amount: number; // Opcional si solo controlan efectivo
    manual_notes?: string;
    calculated_cash: number; // El teórico que calculó el front/back
}): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // Validar duplicados
        const { data: existing } = await supabase
            .from('daily_reconciliations')
            .select('id')
            .eq('branch_id', data.branch_id)
            .eq('date', data.date)
            .maybeSingle();

        if (existing) {
            return { success: false, message: 'Ya existe un corte de caja para esta fecha.' };
        }

        // Calcular discrepancia
        const discrepancy = data.manual_cash_amount - data.calculated_cash;
        // status: si query == manual -> 'balanced', else 'discrepancy'
        // Ojo: Esto es una simplificación. Lo ideal es que el backend recalcule 'calculated_cash' aquí mismo para seguridad.
        // POor ahora confiamos en el parámetro para el MVP, pero idealmente llamamos a getDailyCashSummary internamente.

        // Recálculo de seguridad (Recomendado)
        const summaryResult = await getDailyCashSummary(data.branch_id, data.date);
        const systemCash = summaryResult.success ? summaryResult.data.summary.cashBalance : data.calculated_cash;

        const finalDiscrepancy = data.manual_cash_amount - systemCash;
        const status = Math.abs(finalDiscrepancy) < 1 ? 'balanced' : 'discrepancy'; // Tolerancia de $1

        const { error } = await supabase.from('daily_reconciliations').insert([{
            branch_id: data.branch_id,
            date: data.date,
            manual_total_amount: data.manual_cash_amount, // Asumiendo que 'total' se refiere al efectivo principal
            manual_cash_amount: data.manual_cash_amount,
            manual_card_amount: data.manual_card_amount,
            system_total_amount: systemCash,
            discrepancy: finalDiscrepancy,
            status: status,
            manual_notes: data.manual_notes,
        }]);

        if (error) throw error;

        revalidatePath('/dashboard/finance');
        return { success: true, message: 'Corte de caja realizado correctamente' };
    } catch (error: any) {
        console.error('Error in closeDay:', error);
        return { success: false, message: 'Error al cerrar caja', error: error.message };
    }
}
