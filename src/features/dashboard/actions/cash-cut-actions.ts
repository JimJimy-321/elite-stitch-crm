'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CashCutState = {
    lastCut: {
        id: string;
        end_date: string;
        cash_left: number;
    } | null;
    currentRange: {
        start: string;
        end: string; // "Now"
    };
    totals: {
        initialCash: number;
        cashSales: number;
        cardSales: number;
        transferSales: number;
        expensesCash: number;
        incomesCash: number;
        calculatedCash: number;
        totalSales: number;
        totalExpenses: number;
        grossSales: number;
        totalPending: number;
    };
    transactions: {
        payments: any[];
        expenses: any[];
        items: any[];
    };
};

export type ActionResponse = {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
};

// 1. Obtener Estado Actual de la Caja (Cálculo Continuo)
export async function getCashCutState(branchId: string): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // A. Obtener el ÚLTIMO corte activo
        const { data: lastCut } = await supabase
            .from('cash_cuts')
            .select('*')
            .eq('branch_id', branchId)
            .eq('status', 'active')
            .order('end_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        // B. Definir Fecha de Inicio del Rango Actual
        let startDate: string;
        let initialCash = 0;

        if (lastCut) {
            startDate = lastCut.end_date;
            initialCash = Number(lastCut.cash_left) || 0;
        } else {
            // Si no hay corte previo, buscamos la primera transacción de la historia
            // o usamos una fecha muy antigua por defecto si está vacío
            const { data: firstPayment } = await supabase
                .from('ticket_payments')
                .select('created_at')
                .eq('branch_id', branchId)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();

            startDate = firstPayment?.created_at || new Date(0).toISOString(); // 1970 por defecto
        }

        const endDate = new Date().toISOString(); // "Ahora"

        // C. Obtener Transacciones en el Rango (startDate -> Now)
        // Pagos (Ingresos por Ventas) - Enriquecidos con Folio y Cliente
        const { data: payments } = await supabase
            .from('ticket_payments')
            .select(`
                *,
                ticket:tickets(
                    ticket_number,
                    client:clients(full_name)
                )
            `)
            .eq('branch_id', branchId)
            .gt('created_at', startDate)
            .lte('created_at', endDate);

        // Movimientos (Gastos e Ingresos Extra de Caja)
        const { data: movements } = await supabase
            .from('expenses')
            .select('*')
            .eq('branch_id', branchId)
            .gt('created_at', startDate)
            .lte('created_at', endDate);

        // Tickets/Prendas procesadas en el rango (Entradas/Salidas)
        const { data: items } = await supabase
            .from('ticket_items')
            .select(`
                *,
                ticket:tickets(
                    ticket_number,
                    client:clients(full_name)
                ),
                seamstress:profiles(full_name)
            `)
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: true });

        // Notas creadas en el rango (Venta Bruta)
        const { data: newTickets } = await supabase
            .from('tickets')
            .select('total_amount, balance_due')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        // D. Calcular Totales
        const currentPayments = payments || [];
        const currentMovements = movements || [];

        const cashSales = currentPayments
            .filter(p => p.payment_method === 'efectivo')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const cardSales = currentPayments
            .filter(p => p.payment_method === 'tarjeta')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const transferSales = currentPayments
            .filter(p => p.payment_method === 'transferencia')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const expensesCash = currentMovements
            .filter(m => m.type === 'expense' || !m.type) // Default a expense si es null
            .reduce((sum, m) => sum + Number(m.amount), 0);

        const incomesCash = currentMovements
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + Number(m.amount), 0);
        
        const grossSales = newTickets?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0;
        const totalPending = newTickets?.reduce((sum, t) => sum + Number(t.balance_due || 0), 0) || 0;

        // E. Cálculo Final (Solo Efectivo afecta la caja física)
        // Calculated = (Inicial + VentasEfec + IngresosEfec) - GastosEfec
        const calculatedCash = (initialCash + cashSales + incomesCash) - expensesCash;

        return {
            success: true,
            message: 'Estado calculado',
            data: {
                lastCut: lastCut ? { id: lastCut.id, end_date: lastCut.end_date, cash_left: lastCut.cash_left } : null,
                currentRange: { start: startDate, end: endDate },
                totals: {
                    initialCash,
                    cashSales,
                    cardSales,
                    transferSales,
                    expensesCash,
                    incomesCash,
                    calculatedCash,
                    totalSales: cashSales + cardSales + transferSales,
                    totalExpenses: expensesCash,
                    grossSales,
                    totalPending
                },
                transactions: {
                    payments: currentPayments,
                    expenses: currentMovements,
                    items: items || []
                }
            } as CashCutState
        };

    } catch (error: any) {
        console.error('Error fetching cash cut state:', error);
        return { success: false, message: 'Error al calcular estado de caja', error: error.message };
    }
}

// 2. Realizar Corte de Caja
export async function performCashCut(data: {
    branchId: string;
    userId: string;
    countedCash: number;
    countedCard: number;
    countedTransfer: number;
    withdrawnCash: number;
    notes?: string;
}): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // Recalcular todo en el servidor para "blindar" el proceso
        // Esto asegura que start_date y los totales sean los correctos al milisegundo de ejecución
        const stateRes = await getCashCutState(data.branchId);
        if (!stateRes.success || !stateRes.data) throw new Error(stateRes.message);

        const state = stateRes.data as CashCutState;
        const { totals, currentRange } = state;

        // Calcular Diferencia y Dejado en Caja
        const difference = data.countedCash - totals.calculatedCash;
        const cashLeft = data.countedCash - data.withdrawnCash;

        // Insertar Corte
        const { error } = await supabase.from('cash_cuts').insert({
            branch_id: data.branchId,
            user_id: data.userId,
            start_date: currentRange.start,
            end_date: currentRange.end, // Timestamp exacto del corte

            initial_cash: totals.initialCash,
            cash_sales: totals.cashSales,
            card_sales: totals.cardSales,
            transfer_sales: totals.transferSales,
            expenses_cash: totals.expensesCash,
            incomes_cash: totals.incomesCash,

            cash_withdrawn: data.withdrawnCash,
            calculated_cash: totals.calculatedCash,
            counted_cash: data.countedCash,

            difference: difference,
            cash_left: cashLeft,

            notes: data.notes,
            status: 'active'
        });

        if (error) throw error;

        revalidatePath('/dashboard/finance');
        return { success: true, message: 'Corte de caja realizado correctamente' };

    } catch (error: any) {
        console.error('Error performing cash cut:', error);
        return { success: false, message: 'Error al realizar el corte', error: error.message };
    }
}

// 3. Anular Último Corte (Revertir)
export async function annulCashCut(cutId: string, branchId: string): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // Verificar que sea EL ÚLTIMO corte activo de esa sucursal
        // Para evitar "huecos" en la historia
        const { data: lastCut } = await supabase
            .from('cash_cuts')
            .select('id')
            .eq('branch_id', branchId)
            .eq('status', 'active')
            .order('end_date', { ascending: false })
            .limit(1)
            .single();

        if (!lastCut || lastCut.id !== cutId) {
            return { success: false, message: 'Solo se puede eliminar el último corte de caja activo.' };
        }

        // Marcar como anulado
        const { error } = await supabase
            .from('cash_cuts')
            .update({ status: 'annulled' })
            .eq('id', cutId);

        if (error) throw error;

        revalidatePath('/dashboard/finance');
        return { success: true, message: 'Corte eliminado (anulado) correctamente' };

    } catch (error: any) {
        console.error('Error annulling cash cut:', error);
        return { success: false, message: 'Error al eliminar corte', error: error.message };
    }
}

// 4. Obtener Historial de Cortes (Nueva Tabla)
export async function getCashCutsHistory(branchId: string): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        const { data: cuts, error } = await supabase
            .from('cash_cuts')
            .select('*')
            .eq('branch_id', branchId)
            .order('end_date', { ascending: false })
            .limit(30);

        if (error) throw error;

        return { success: true, message: 'Historial obtenido', data: cuts };
    } catch (error: any) {
        console.error('Error in getCashCutsHistory:', error);
        return { success: false, message: 'Error al obtener historial', error: error.message };
    }
}

// 5. Registrar Movimiento (Gasto / Ingreso) - Sin validación de cierre diario
export async function registerMovement(data: {
    branch_id: string;
    amount: number;
    concept: string;
    category: string;
    recorded_by: string;
    type: 'expense' | 'income';
}): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        const validCategories = ['Insumos', 'Servicios', 'Sueldos', 'Renta', 'Mantenimiento', 'Otros'];
        const finalCategory = validCategories.includes(data.category) ? data.category : 'Otros';

        const { error } = await supabase.from('expenses').insert([{
            branch_id: data.branch_id,
            amount: data.amount,
            concept: data.concept,
            category: finalCategory,
            recorded_by: data.recorded_by,
            type: data.type,
            created_at: new Date().toISOString()
        }]);

        if (error) throw error;

        revalidatePath('/dashboard/finance');
        return { success: true, message: 'Movimiento registrado correctamente' };
    } catch (error: any) {
        console.error('Error in registerMovement:', error);
        return { success: false, message: 'Error al registrar movimiento', error: error.message };
    }
}
// 6. Obtener Datos Detallados para Reporte Z
export async function getReportZData(cutId: string): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // A. Obtener el corte para saber el rango de fechas
        const { data: cut, error: cutError } = await supabase
            .from('cash_cuts')
            .select('*')
            .eq('id', cutId)
            .single();

        if (cutError || !cut) throw new Error('Corte no encontrado');

        // B. Obtener todos los items de tickets creados en ese periodo
        // Ojo: Podríamos basarnos en pagos realizados o tickets creados. 
        // El Reporte Z tradicional se basa en lo que ingresó a caja y lo realizado.
        const { data: items, error: itemsError } = await supabase
            .from('ticket_items')
            .select(`
                id,
                price,
                garment_name,
                service_name,
                status,
                seamstress:profiles(full_name),
                ticket:tickets(
                    ticket_number,
                    created_at,
                    delivery_date,
                    client:clients(full_name, phone)
                )
            `)
            .gte('created_at', cut.start_date)
            .lte('created_at', cut.end_date)
            .order('created_at', { ascending: true });

        if (itemsError) throw itemsError;

        return {
            success: true,
            message: 'Datos de Reporte Z obtenidos',
            data: {
                cut,
                items: items || []
            }
        };
    } catch (error: any) {
        console.error('Error in getReportZData:', error);
        return { success: false, message: 'Error al obtener datos del reporte', error: error.message };
    }
}
