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

        // B. Obtener Movimientos (Gastos e Ingresos Extra) del día
        const { data: movements, error: movementsError } = await supabase
            .from('expenses')
            .select('*')
            .eq('branch_id', branchId)
            .gte('created_at', startOfDay)
            .lt('created_at', endOfDay)
            .order('created_at', { ascending: false });

        if (movementsError) throw movementsError;

        // Separar gastos e ingresos
        const expenses = movements?.filter(m => m.type === 'expense' || !m.type) || [];
        const extraIncomes = movements?.filter(m => m.type === 'income') || [];

        // C. Calcular Totales
        const cashIncome = payments
            ?.filter((p) => p.payment_method === 'efectivo')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const cardIncome = payments
            ?.filter((p) => p.payment_method === 'tarjeta')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const transferIncome = payments
            ?.filter((p) => p.payment_method === 'transferencia')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalExtraIncome = extraIncomes.reduce((sum, i) => sum + Number(i.amount), 0);

        // D. Obtener Saldo Inicial (Corte Anterior)
        const { data: lastCut } = await supabase
            .from('daily_reconciliations')
            .select('manual_cash_amount')
            .eq('branch_id', branchId)
            .lt('date', date)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();

        const openingBalance = lastCut?.manual_cash_amount || 0;

        // Cash Balance = (Saldo Inicial + Ingresos Efectivo + Ingresos Extra) - Gastos
        const cashBalance = (openingBalance + cashIncome + totalExtraIncome) - totalExpenses;

        // Verificación de Corte Existente
        const { data: reconciliation } = await supabase
            .from('daily_reconciliations')
            .select('*')
            .eq('branch_id', branchId)
            .eq('date', date)
            .maybeSingle();

        // Calcular Meta Mensual
        const [year, month] = date.split('-');
        const startOfMonth = `${year}-${month}-01T06:00:00.000Z`;

        const { data: monthlyPayments } = await supabase
            .from('ticket_payments')
            .select('amount')
            .eq('branch_id', branchId)
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfDay);

        const monthlyTotal = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        return {
            success: true,
            data: {
                movements: {
                    incomes: [...(payments || []), ...extraIncomes], // Mezclamos pagos y aportes
                    expenses: expenses,
                },
                summary: {
                    cashIncome,
                    cardIncome,
                    transferIncome,
                    totalExpenses,
                    totalExtraIncome, // Nuevo
                    openingBalance,
                    cashBalance,
                    monthlyTotal,
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
// 2. Registrar Gasto / Ingreso (Fondo)
// ----------------------------------------------------------------------
export async function registerExpense(data: {
    branch_id: string;
    amount: number;
    concept: string; // 'Gasto' o 'Fondo de Caja'
    category: string;
    recorded_by: string;
    type?: 'expense' | 'income'; // Nuevo campo opcional
    date?: string;
}): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // Validar si la caja ya está cerrada
        // Si se nos pasa una fecha específica, usamos esa. Si no, hoy (MX).
        const targetDate = data.date ? new Date(data.date).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }) : new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

        const { data: existingClose } = await supabase
            .from('daily_reconciliations')
            .select('id')
            .eq('branch_id', data.branch_id)
            .eq('date', targetDate)
            .maybeSingle();

        if (existingClose) {
            return { success: false, message: `La caja del día ${targetDate} ya está cerrada. No se pueden registrar movimientos.` };
        }

        // Si hay fecha, armamos el timestamp con hora 12:00 PM para evitar problemas de zona horaria al guardar
        // Ojo: created_at es timestamptz.
        const createdAt = data.date ? `${targetDate}T12:00:00-06:00` : new Date().toISOString();

        const { error } = await supabase.from('expenses').insert([{
            branch_id: data.branch_id,
            amount: data.amount,
            concept: data.concept,
            category: data.category,
            recorded_by: data.recorded_by,
            type: data.type || 'expense',
            created_at: createdAt, // Usamos fecha forzada si existe
        }]);

        if (error) throw error;

        revalidatePath('/dashboard/finance');
        return { success: true, message: 'Movimiento registrado correctamente' };
    } catch (error: any) {
        console.error('Error in registerExpense:', error);
        return { success: false, message: 'Error al registrar movimiento', error: error.message };
    }
}

// ----------------------------------------------------------------------
// 3. Cerrar Caja (Daily Close)
// ----------------------------------------------------------------------
export async function closeDay(data: {
    branch_id: string;
    date: string; // YYYY-MM-DD
    manual_cash_amount: number;
    manual_card_amount: number;
    manual_notes?: string;
    calculated_cash: number;
}): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        const { data: existing } = await supabase
            .from('daily_reconciliations')
            .select('id')
            .eq('branch_id', data.branch_id)
            .eq('date', data.date)
            .maybeSingle();

        if (existing) {
            return { success: false, message: 'Ya existe un corte de caja para esta fecha.' };
        }

        // FIX: Usar el valor calculado por el frontend como 'system_total' para evitar discrepancias por zona horaria
        // El backend recalcula solo para auditoría interna si fuera necesario, pero para la tabla usamos lo que vio el usuario.
        // const summaryResult = await getDailyCashSummary(data.branch_id, data.date);
        // const systemCash = summaryResult.success ? summaryResult.data.summary.cashBalance : data.calculated_cash;
        const systemCash = data.calculated_cash;

        // Calcular status (solo para info, la DB lo guarda)
        const finalDiscrepancy = data.manual_cash_amount - systemCash;
        const status = Math.abs(finalDiscrepancy) < 1 ? 'balanced' : 'discrepancy';

        const { error } = await supabase.from('daily_reconciliations').insert([{
            branch_id: data.branch_id,
            date: data.date,
            manual_total_amount: data.manual_cash_amount,
            manual_cash_amount: data.manual_cash_amount,
            manual_card_amount: data.manual_card_amount,
            system_total_amount: systemCash, // Usamos el valor del frontend
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

// ----------------------------------------------------------------------
// 5. Reabrir Caja (Eliminar Corte)
// ----------------------------------------------------------------------
export async function reopenDay(branchId: string, date: string): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('daily_reconciliations')
            .delete()
            .eq('branch_id', branchId)
            .eq('date', date);

        if (error) throw error;

        revalidatePath('/dashboard/finance');
        return { success: true, message: 'Caja reabierta correctamente' };
    } catch (error: any) {
        console.error('Error in reopenDay:', error);
        return { success: false, message: 'Error al reabrir caja', error: error.message };
    }
}

// ----------------------------------------------------------------------
// 4. Obtener Historial de Cortes
// ----------------------------------------------------------------------
export async function getCashCutsHistory(branchId: string): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        const { data: cuts, error } = await supabase
            .from('daily_reconciliations')
            .select('*')
            .eq('branch_id', branchId)
            .order('date', { ascending: false })
            .limit(30);

        if (error) throw error;

        return { success: true, data: cuts };
    } catch (error: any) {
        console.error('Error in getCashCutsHistory:', error);
        return { success: false, message: 'Error al obtener historial', error: error.message };
    }
}
