import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const dashboardService = {
    async checkNotaExists(notaNumber: string) {
        const { data, error } = await supabase
            .from('tickets')
            .select('id')
            .eq('ticket_number', notaNumber)
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    async getNotas(search?: string, filters?: { garment?: string, seamstress_id?: string }) {
        let query = supabase
            .from('tickets')
            .select(`
                *,
                client:clients(full_name, phone),
                branch:branches(name),
                items:ticket_items(*)
            `);

        // Filtros de BD directos
        if (filters?.seamstress_id) {
            query = query.filter('items.seamstress_id', 'eq', filters.seamstress_id);
        }

        if (filters?.garment) {
            query = query.filter('items.garment_name', 'ilike', `%${filters.garment}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

        if (error) throw error;

        // Filtro por búsqueda (Cliente o Número)
        if (search) {
            const searchNormalized = search.toUpperCase();
            return data.filter((t: any) =>
                t.ticket_number?.toUpperCase().includes(searchNormalized) ||
                t.client?.full_name?.toUpperCase().includes(searchNormalized) ||
                t.client?.phone?.includes(searchNormalized)
            );
        }

        return data;
    },

    async getClients(search?: string) {
        let query = supabase
            .from('clients')
            .select('*');

        if (search) {
            const s = search.toUpperCase();
            query = query.or(`full_name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data;
    },

    async createClient(clientData: { full_name: string, phone: string, email?: string, organization_id: string, last_branch_id?: string }) {
        const { data, error } = await supabase
            .from('clients')
            .insert(clientData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateClient(id: string, clientData: any) {
        const { data, error } = await supabase
            .from('clients')
            .update(clientData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteClient(id: string) {
        const { data: activeTickets, error: checkError } = await supabase
            .from('tickets')
            .select('id, ticket_number, status')
            .eq('client_id', id)
            .neq('status', 'delivered');

        if (checkError) throw checkError;

        if (activeTickets && activeTickets.length > 0) {
            throw new Error(
                `No se puede eliminar el cliente porque tiene ${activeTickets.length} ${activeTickets.length === 1 ? 'orden activa' : 'órdenes activas'
                }. Debe entregarlas o reasignarlas primero.`
            );
        }

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === '23503') {
                throw new Error("No se puede eliminar el cliente porque tiene historial de tickets o deudas. Elimine los registros relacionados primero.");
            }
            throw error;
        }
        return true;
    },

    async getBranches() {
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getStats(branchId?: string) {
        const today = new Date().toLocaleDateString('en-CA');
        
        // Fetch ALL active tickets for the queue counts (Recibidos, En Proceso, Listos)
        let activeQuery = supabase
            .from('tickets')
            .select('status, total_amount, branch_id')
            .neq('status', 'delivered');

        if (branchId) {
            activeQuery = activeQuery.eq('branch_id', branchId);
        }

        const { data: activeTickets } = await activeQuery;

        // Fetch TODAY'S delivered tickets
        let deliveredQuery = supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'delivered')
            .gte('updated_at', `${today}T00:00:00`)
            .lte('updated_at', `${today}T23:59:59`);
        
        if (branchId) deliveredQuery = deliveredQuery.eq('branch_id', branchId);
        const { count: deliveredToday } = await deliveredQuery;

        // Fetch TODAY'S revenue (created today)
        let revenueQuery = supabase
            .from('tickets')
            .select('total_amount')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);
        
        if (branchId) revenueQuery = revenueQuery.eq('branch_id', branchId);
        const { data: todayTickets } = await revenueQuery;

        const stats = {
            received: activeTickets?.filter(t => t.status === 'received').length || 0,
            processing: activeTickets?.filter(t => t.status === 'processing').length || 0,
            ready: activeTickets?.filter(t => t.status === 'ready').length || 0,
            delivered: deliveredToday || 0,
            totalRevenue: todayTickets?.reduce((acc, t) => acc + Number(t.total_amount || 0), 0) || 0
        };

        return stats;
    },

    async getOwners() {
        const { data, error } = await supabase
            .from('organizations')
            .select(`
                *,
                owner_profile:profiles!profiles_organization_id_fkey(full_name, id)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAdminStats() {
        const [{ count: ownersCount }, { count: botsCount }, { data: organizations }] = await Promise.all([
            supabase.from('organizations').select('*', { count: 'exact', head: true }),
            supabase.from('agent_configs').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('organizations').select('plan_name')
        ]);

        const planPrices: Record<string, number> = {
            'Mensual': 49,
            'Anual Pro': 399,
            'Enterprise': 999,
            'Trial': 0
        };

        const totalMRR = organizations?.reduce((acc, org) => {
            const price = planPrices[org.plan_name || 'Trial'] || 0;
            return acc + price;
        }, 0) || 0;

        return {
            totalOwners: ownersCount || 0,
            activeBots: botsCount || 0,
            totalMRR: totalMRR,
            uptime: "99.99%"
        };
    },

    async createOwner(ownerData: { name: string, email: string, plan: string, branches: number }) {
        const { data, error } = await supabase
            .from('organizations')
            .insert({
                name: `${ownerData.name} Org`,
                contact_name: ownerData.name,
                contact_email: ownerData.email,
                plan_name: ownerData.plan,
                max_branches: ownerData.branches,
                subscription_status: 'active'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getGarments() {
        const { data, error } = await supabase
            .from('garment_catalogs')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getServices() {
        const { data, error } = await supabase
            .from('service_catalogs')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getDiscountByCode(code: string) {
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .gte('valid_to', new Date().toISOString())
            .single();

        if (error) return null;
        return data;
    },

    async createAdvancedNota(notaData: any, items: any[], payment: any) {
        const { data: ticket, error: tError } = await supabase
            .from('tickets')
            .insert({
                ticket_number: notaData.ticket_number,
                branch_id: notaData.branch_id,
                client_id: notaData.client_id,
                delivery_date: notaData.delivery_date,
                notes: notaData.notes,
                total_amount: notaData.total_amount,
                balance_due: notaData.balance_due,
                discount_id: notaData.discount_id,
                discount_amount: notaData.discount_amount,
                status: 'received'
            })
            .select()
            .single();

        if (tError) {
            if (tError.code === '23505') throw new Error('El número de nota ya existe');
            throw tError;
        }

        const itemsWithTicket = items.map(item => ({
            ...item,
            ticket_id: ticket.id
        }));

        const { error: iError } = await supabase
            .from('ticket_items')
            .insert(itemsWithTicket);

        if (iError) throw iError;

        if (payment && payment.amount > 0) {
            const { error: pError } = await supabase
                .from('ticket_payments')
                .insert({
                    ticket_id: ticket.id,
                    amount: payment.amount,
                    payment_method: payment.method,
                    payment_type: 'anticipo',
                    branch_id: notaData.branch_id
                });
            if (pError) throw pError;
        }

        return ticket;
    },

    async getDailyReport(branchId?: string) {
        const today = new Date().toLocaleDateString('en-CA');

        let query = supabase
            .from('ticket_payments')
            .select('*, ticket:tickets(*, client:clients(full_name))')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) query = query.eq('branch_id', branchId);

        const { data: payments, error: pError } = await query;
        if (pError) throw pError;

        let expQuery = supabase
            .from('expenses')
            .select('*')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) expQuery = expQuery.eq('branch_id', branchId);

        const { data: expenses, error: eError } = await expQuery;
        if (eError) throw eError;

        let ticketsQuery = supabase
            .from('tickets')
            .select('total_amount, balance_due')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) ticketsQuery = ticketsQuery.eq('branch_id', branchId);

        const { data: tickets, error: tError } = await ticketsQuery;
        if (tError) throw tError;

        // Fetch today's items for Production section
        let itemsQuery = supabase
            .from('ticket_items')
            .select('*, ticket:tickets(ticket_number)')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) itemsQuery = itemsQuery.eq('branch_id', branchId);
        const { data: items, error: iError } = await itemsQuery;
        if (iError) throw iError;

        // Fetch ALL global pending balances for "Por Cobrar"
        let allPendingQuery = supabase
            .from('tickets')
            .select('balance_due')
            .gt('balance_due', 0)
            .neq('status', 'delivered');
        
        if (branchId) allPendingQuery = allPendingQuery.eq('branch_id', branchId);
        const { data: allPending } = await allPendingQuery;

        return {
            payments,
            expenses,
            tickets,
            items: items || [],
            summary: {
                totalCash: payments?.filter(p => p.payment_method === 'efectivo').reduce((acc, p) => acc + Number(p.amount), 0) || 0,
                totalCard: payments?.filter(p => p.payment_method === 'tarjeta').reduce((acc, p) => acc + Number(p.amount), 0) || 0,
                totalTransfer: payments?.filter(p => p.payment_method === 'transferencia').reduce((acc, p) => acc + Number(p.amount), 0) || 0,
                totalExpenses: expenses?.filter(e => e.type === 'expense' || !e.type).reduce((acc, e) => acc + Number(e.amount), 0) || 0,
                totalIncomes: expenses?.filter(e => e.type === 'income').reduce((acc, e) => acc + Number(e.amount), 0) || 0,
                totalGross: tickets?.reduce((acc, t) => acc + Number(t.total_amount), 0) || 0,
                totalPending: allPending?.reduce((acc, t) => acc + Number(t.balance_due), 0) || 0,
            }
        };
    },

    async getGlobalConfig(key: string) {
        const { data, error } = await supabase
            .from('global_config')
            .select('*')
            .eq('key', key)
            .single();

        if (error) throw error;
        return data.value;
    },

    async updateGlobalConfig(key: string, value: any) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('global_config')
            .upsert({ key, value, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getFinanceStats() {
        const [{ data: payments }, { data: expenses }, { data: tickets }] = await Promise.all([
            supabase.from('ticket_payments').select('amount'),
            supabase.from('expenses').select('amount'),
            supabase.from('tickets').select('balance_due')
        ]);

        const totalIncome = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
        const totalExpenses = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0;
        const totalReceivable = tickets?.reduce((acc, t) => acc + Number(t.balance_due), 0) || 0;

        return {
            totalIncome,
            totalExpenses,
            totalReceivable,
            netBalance: totalIncome - totalExpenses
        };
    },

    async addPayment(notaId: string, paymentData: { amount: number, method: string, type: 'abono' | 'liquidacion', branch_id: string }) {
        const { data: payment, error: pError } = await supabase
            .from('ticket_payments')
            .insert({
                ticket_id: notaId,
                amount: paymentData.amount,
                payment_method: paymentData.method,
                payment_type: paymentData.type,
                branch_id: paymentData.branch_id
            })
            .select()
            .single();

        if (pError) throw pError;

        const { data: ticket } = await supabase.from('tickets').select('balance_due').eq('id', notaId).single();
        const newBalance = Math.max(0, Number(ticket?.balance_due || 0) - paymentData.amount);

        const { error: tError } = await supabase
            .from('tickets')
            .update({ balance_due: newBalance })
            .eq('id', notaId);

        if (tError) throw tError;
        return payment;
    },

    async updateItemStatus(itemId: string, status: string) {
        const { data: item, error: iError } = await supabase
            .from('ticket_items')
            .update({ status })
            .eq('id', itemId)
            .select()
            .single();
        if (iError) throw iError;

        const { data: allItems, error: aError } = await supabase
            .from('ticket_items')
            .select('status')
            .eq('ticket_id', item.ticket_id);

        if (aError) throw aError;

        let newNotaStatus = 'received';
        const states = allItems?.map(i => i.status) || [];

        if (states.every(s => s === 'finished')) {
            newNotaStatus = 'ready';
        } else if (states.some(s => s === 'in_process' || s === 'finished')) {
            newNotaStatus = 'processing';
        }

        const { error: tError } = await supabase
            .from('tickets')
            .update({ status: newNotaStatus })
            .eq('id', item.ticket_id);

        if (tError) throw tError;

        return item;
    },

    async deliverNota(notaId: string) {
        const { error } = await supabase
            .from('tickets')
            .update({ status: 'delivered', updated_at: new Date().toISOString() })
            .eq('id', notaId);
        if (error) throw error;
        return true;
    },

    async getDailyFinancials(branch_id?: string) {
        const today = new Date().toLocaleDateString('en-CA');

        // Fetch last active cash cut to get initial balance
        let activeCutQuery = supabase
            .from('cash_cuts')
            .select('cash_left, end_date')
            .eq('status', 'active');
        
        if (branch_id) activeCutQuery = activeCutQuery.eq('branch_id', branch_id);
        
        const { data: activeCut } = await activeCutQuery
            .order('end_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        const initialCash = Number(activeCut?.cash_left || 0);
        const startDate = activeCut?.end_date || `${today}T00:00:00`;

        // Fetch payments since startDate
        let paymentsQuery = supabase
            .from('ticket_payments')
            .select('amount, payment_method, payment_type')
            .gt('created_at', startDate)
            .lte('created_at', new Date().toISOString());

        if (branch_id) paymentsQuery = paymentsQuery.eq('branch_id', branch_id);

        const { data: payments, error: pError } = await paymentsQuery;
        if (pError) throw pError;

        // Fetch expenses since startDate
        let expensesQuery = supabase
            .from('expenses')
            .select('amount, type')
            .gt('created_at', startDate)
            .lte('created_at', new Date().toISOString());

        if (branch_id) expensesQuery = expensesQuery.eq('branch_id', branch_id);

        const { data: expenses, error: eError } = await expensesQuery;
        if (eError) throw eError;

        // Fetch tickets for TODAY (for Sales KPI)
        let ticketsQuery = supabase
            .from('tickets')
            .select('total_amount, status')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branch_id) ticketsQuery = ticketsQuery.eq('branch_id', branch_id);

        const { data: tickets, error: tError } = await ticketsQuery;
        if (tError) throw tError;

        const incomeTotals = {
            total: payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
            anticipos: payments?.filter(p => p.payment_type === 'anticipo').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
            liquidaciones: payments?.filter(p => (p.payment_type === 'liquidacion' || p.payment_type === 'pago')).reduce((sum, p) => sum + Number(p.amount), 0) || 0,
            methods: {
                cash: payments?.filter(p => p.payment_method === 'efectivo').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
                card: payments?.filter(p => p.payment_method === 'tarjeta').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
                transfer: payments?.filter(p => p.payment_method === 'transferencia').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
            }
        };

        const expenseTotals = {
            total: expenses?.filter(e => e.type === 'expense' || !e.type).reduce((sum, e) => sum + Number(e.amount), 0) || 0,
            incomes: expenses?.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0) || 0,
        };

        const salesTotals = {
            total: tickets?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0,
            count: tickets?.length || 0
        };

        return {
            income: incomeTotals.total, // User calls this "Ventas Totales" (Money in)
            expense: expenseTotals.total,
            netCash: initialCash + incomeTotals.methods.cash + expenseTotals.incomes - expenseTotals.total,
            dailySales: salesTotals.total, // Physical production/notes created
            breakdown: {
                income: incomeTotals,
                expenses: expenseTotals,
                sales: salesTotals,
                initialCash
            }
        };
    },

    async getActiveWorkQueue(branchId?: string) {
        let query = supabase
            .from('tickets')
            .select(`
                *,
                client:clients(full_name, phone),
                branch:branches(name),
                items:ticket_items(*)
            `)
            .neq('status', 'delivered');

        if (branchId) {
            query = query.eq('branch_id', branchId);
        }

        const { data, error } = await query.order('delivery_date', { ascending: true });

        if (error) throw error;
        return data;
    }
};
