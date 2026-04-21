import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const dashboardService = {
    async checkNotaExists(notaNumber: string, branchId?: string) {
        if (!branchId) {
            console.warn('checkNotaExists called without branchId');
            return false; // No podemos validar sin sucursal, asumimos que no existe para no bloquear
        }

        const { data, error } = await supabase
            .from('tickets')
            .select('id')
            .eq('ticket_number', notaNumber)
            .eq('branch_id', branchId)
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    async getNotas(search?: string, filters?: { garment?: string, seamstress_id?: string, status?: string, startDate?: string, endDate?: string }, branchId?: string, orgId?: string) {
        let branchIds: string[] = [];
        if (!branchId && orgId) {
            const { data } = await supabase.from('branches').select('id').eq('organization_id', orgId);
            branchIds = data?.map(b => b.id) || [];
            if (branchIds.length === 0) return [];
        }

        let query = supabase
            .from('tickets')
            .select(`
                *,
                client:clients(full_name, phone),
                branch:branches(name),
                items:ticket_items(*)
            `);

        if (branchId) {
            query = query.eq('branch_id', branchId);
        } else if (branchIds.length > 0) {
            query = query.in('branch_id', branchIds);
        }

        // Filtros de BD directos
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.seamstress_id) {
            query = query.filter('items.seamstress_id', 'eq', filters.seamstress_id);
        }

        if (filters?.garment) {
            query = query.filter('items.garment_name', 'ilike', `%${filters.garment}%`);
        }

        if (filters?.startDate) {
            query = query.gte('created_at', `${filters.startDate}T00:00:00`);
        }

        if (filters?.endDate) {
            query = query.lte('created_at', `${filters.endDate}T23:59:59`);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

        if (error) throw error;

        // Normalizar items (asegurar que siempre sea un array y manejar alias)
        const normalizedData = data.map((t: any) => ({
            ...t,
            items: t.items || t.ticket_items || []
        }));

        // Filtro por búsqueda (Cliente o Número)
        if (search) {
            const searchNormalized = search.toUpperCase();
            return normalizedData.filter((t: any) =>
                t.ticket_number?.toUpperCase().includes(searchNormalized) ||
                t.client?.full_name?.toUpperCase().includes(searchNormalized) ||
                t.client?.phone?.includes(searchNormalized)
            );
        }

        return normalizedData;
    },

    async getClients(search?: string, branchId?: string, orgId?: string) {
        let query = supabase
            .from('clients')
            .select('*');

        if (orgId) {
            query = query.eq('organization_id', orgId);
        }

        if (branchId) {
            query = query.eq('last_branch_id', branchId);
        }

        if (search) {
            const s = search.toUpperCase();
            query = query.or(`full_name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(100);

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
            .select('id, ticket_number, status, balance_due')
            .eq('client_id', id)
            .or('status.neq.delivered,balance_due.gt.0');

        if (checkError) throw checkError;

        if (activeTickets && activeTickets.length > 0) {
            const hasDebt = activeTickets.some((t: any) => t.balance_due > 0);
            const hasActive = activeTickets.some((t: any) => t.status !== 'delivered');
            
            let message = `No se puede eliminar el cliente porque tiene ${activeTickets.length} registro(s) pendiente(s).`;
            if (hasDebt && hasActive) message = "El cliente tiene órdenes activas y deudas pendientes.";
            else if (hasDebt) message = "El cliente tiene deudas pendientes en órdenes terminadas.";
            else if (hasActive) message = "El cliente tiene órdenes en proceso o listas para entrega.";

            throw new Error(message);
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

    async getBranches(organizationId?: string, includeArchived: boolean = false) {
        let query = supabase
            .from('branches')
            .select('*')
            .order('name', { ascending: true });

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        if (!includeArchived) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    },

    async createBranch(branchData: { name: string, address: string, organization_id: string }) {
        const { data, error } = await supabase
            .from('branches')
            .insert(branchData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateBranch(id: string, branchData: any) {
        const { data, error } = await supabase
            .from('branches')
            .update(branchData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteBranch(id: string) {
        // Verificar si tiene tickets
        const { data: hasTickets } = await supabase
            .from('tickets')
            .select('id')
            .eq('branch_id', id)
            .limit(1);

        if (hasTickets && hasTickets.length > 0) {
            throw new Error("No se puede eliminar físicamente la sede porque tiene órdenes o historial registrado. Intente 'Archivar' en su lugar.");
        }

        const { error } = await supabase
            .from('branches')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async archiveBranch(id: string) {
        const { error } = await supabase
            .from('branches')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async updateProfile(userId: string, updates: any) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Seguridad: Autoriza el dispositivo actual para una sucursal específica
     */
    async authorizeCurrentDevice(branchId: string, fingerprint: string, friendlyName: string) {
        const { error } = await supabase.rpc('authorize_current_device', {
            p_branch_id: branchId,
            p_token_hash: fingerprint,
            p_device_name: friendlyName
        });

        if (error) throw error;
        
        // La RPC devuelve void, así que construimos la respuesta de éxito manual
        // El token del dispositivo es el propio fingerprint en este sistema
        return { 
            success: true, 
            device_token: fingerprint 
        };
    },

    /**
     * Seguridad: Autentica a un trabajador usando su PIN y validando el dispositivo
     */
    async authenticateByPin(pin: string, branchId: string, deviceToken: string) {
        const { data, error } = await supabase.rpc('authenticate_worker_by_pin', {
            p_branch_id: branchId,
            p_pin: pin,
            p_device_token_hash: deviceToken
        });

        if (error) {
            console.error('[RPC_ERROR] authenticate_worker_by_pin:', error);
            return { success: false, error: error.message };
        }
        
        // El RPC retorna un conjunto de filas (o una con RETURNS TABLE)
        const result = data && data.length > 0 ? data[0] : null;

        if (!result || !result.is_device_valid) {
            return { success: false, error: 'Dispositivo no autorizado para esta sucursal' };
        }

        if (!result.user_id) {
            return { success: false, error: 'PIN incorrecto' };
        }

        return { 
            success: true, 
            profile: {
                id: result.user_id,
                full_name: result.full_name,
                role: result.role,
                branch_id: result.branch_id
            }
        };
    },

    async getStats(branchId?: string, filters?: { startDate?: string, endDate?: string }, orgId?: string) {
        const today = new Date().toLocaleDateString('en-CA');
        
        let branchIds: string[] = [];
        if (!branchId && orgId) {
            const { data } = await supabase.from('branches').select('id').eq('organization_id', orgId);
            branchIds = data?.map(b => b.id) || [];
            if (branchIds.length === 0) return { received: 0, processing: 0, ready: 0, delivered: 0, totalRevenue: 0 };
        }

        // Fetch ALL active tickets for the queue counts (Recibidos, En Proceso, Listos)
        let activeQuery = supabase
            .from('tickets')
            .select('status, total_amount, branch_id')
            .neq('status', 'delivered');

        if (branchId) {
            activeQuery = activeQuery.eq('branch_id', branchId);
        } else if (branchIds.length > 0) {
            activeQuery = activeQuery.in('branch_id', branchIds);
        }
        
        if (filters?.startDate) {
            activeQuery = activeQuery.gte('created_at', `${filters.startDate}T00:00:00`);
        }

        if (filters?.endDate) {
            activeQuery = activeQuery.lte('created_at', `${filters.endDate}T23:59:59`);
        }

        const { data: activeTickets } = await activeQuery;

        // Fetch delivered tickets
        let deliveredQuery = supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'delivered');
            
        if (branchId) {
            deliveredQuery = deliveredQuery.eq('branch_id', branchId);
        } else if (branchIds.length > 0) {
            deliveredQuery = deliveredQuery.in('branch_id', branchIds);
        }
        
        if (filters?.startDate) {
            deliveredQuery = deliveredQuery.gte('created_at', `${filters.startDate}T00:00:00`);
            if (filters?.endDate) {
                deliveredQuery = deliveredQuery.lte('created_at', `${filters.endDate}T23:59:59`);
            }
        } else {
            // Default for Dashboard: today's delivered items
            deliveredQuery = deliveredQuery.gte('updated_at', `${today}T00:00:00`).lte('updated_at', `${today}T23:59:59`);
        }
        
        const { count: deliveredCount } = await deliveredQuery;

        // Fetch TODAY'S revenue (from PAYMENTS received today)
        let revenueQuery = supabase
            .from('ticket_payments')
            .select('amount')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);
        
        if (branchId) {
            revenueQuery = revenueQuery.eq('branch_id', branchId);
        } else if (branchIds.length > 0) {
            revenueQuery = revenueQuery.in('branch_id', branchIds);
        }
        const { data: todayPayments } = await revenueQuery;

        const stats = {
            received: activeTickets?.filter(t => t.status === 'received').length || 0,
            processing: activeTickets?.filter(t => t.status === 'processing').length || 0,
            ready: activeTickets?.filter(t => t.status === 'ready').length || 0,
            delivered: deliveredCount || 0,
            totalRevenue: todayPayments?.reduce((acc, p) => acc + Number(p.amount || 0), 0) || 0
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

    async getProfiles(organizationId?: string, branchId?: string) {
        let query = supabase
            .from('profiles')
            .select('*');

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        if (branchId) {
            query = query.eq('assigned_branch_id', branchId);
        }

        const { data, error } = await query.order('full_name', { ascending: true });
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

    async getDiscountByCode(code: string, branchId?: string) {
        // 1. Intentar buscar en las nuevas PROMOCIONES de Marketing primero
        let promoQuery = supabase
            .from('promotions')
            .select('*')
            .eq('discount_code', code.toUpperCase())
            .eq('is_active', true);
            
        if (branchId) {
            promoQuery = promoQuery.or(`target_branch_id.is.null,target_branch_id.eq.${branchId}`);
        }

        const { data: promo } = await promoQuery.maybeSingle();

        if (promo) {
            return {
                id: promo.id,
                value: promo.discount_value,
                discount_type: promo.discount_type,
                is_promo: true // Flag para saber que viene de la nueva tabla
            };
        }

        // 2. Fallback a la tabla antigua de DISCOUNTS
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .gte('valid_to', new Date().toISOString())
            .maybeSingle();

        if (error || !data) return null;
        
        return {
            id: data.id,
            value: data.value,
            discount_type: data.discount_type,
            is_promo: false
        };
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
                discount_id: notaData.is_promo ? null : notaData.discount_id,
                promotion_id: notaData.is_promo ? notaData.discount_id : null,
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

    async getDailyReport(branchId?: string, orgId?: string) {
        const today = new Date().toLocaleDateString('en-CA');

        let branchIds: string[] = [];
        if (!branchId && orgId) {
            const { data } = await supabase.from('branches').select('id').eq('organization_id', orgId);
            branchIds = data?.map(b => b.id) || [];
            if (branchIds.length === 0) return {
                payments: [], expenses: [], tickets: [], items: [], summary: { totalCash: 0, totalCard: 0, totalTransfer: 0, totalExpenses: 0, totalIncomes: 0, totalGross: 0, totalPending: 0 }
            };
        }

        let query = supabase
            .from('ticket_payments')
            .select('*, ticket:tickets(*, client:clients(full_name))')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) query = query.eq('branch_id', branchId);
        else if (branchIds.length > 0) query = query.in('branch_id', branchIds);

        const { data: payments, error: pError } = await query;
        if (pError) throw pError;

        let expQuery = supabase
            .from('expenses')
            .select('*')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) expQuery = expQuery.eq('branch_id', branchId);
        else if (branchIds.length > 0) expQuery = expQuery.in('branch_id', branchIds);

        const { data: expenses, error: eError } = await expQuery;
        if (eError) throw eError;

        let ticketsQuery = supabase
            .from('tickets')
            .select('total_amount, balance_due')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) ticketsQuery = ticketsQuery.eq('branch_id', branchId);
        else if (branchIds.length > 0) ticketsQuery = ticketsQuery.in('branch_id', branchIds);

        const { data: tickets, error: tError } = await ticketsQuery;
        if (tError) throw tError;

        // Fetch today's items for Production section
        let itemsQuery = supabase
            .from('ticket_items')
            .select('*, ticket:tickets(ticket_number)')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (branchId) itemsQuery = itemsQuery.eq('branch_id', branchId);
        else if (branchIds.length > 0) itemsQuery = itemsQuery.in('branch_id', branchIds);
        const { data: items, error: iError } = await itemsQuery;
        if (iError) throw iError;

        // Fetch ALL global pending balances for "Por Cobrar"
        let allPendingQuery = supabase
            .from('tickets')
            .select('balance_due')
            .gt('balance_due', 0)
            .neq('status', 'delivered');
        
        if (branchId) allPendingQuery = allPendingQuery.eq('branch_id', branchId);
        else if (branchIds.length > 0) allPendingQuery = allPendingQuery.in('branch_id', branchIds);
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

    async getFinanceStats(orgId?: string, filters?: { startDate?: string, endDate?: string }) {
        let branchIds: string[] = [];
        let branches: any[] = [];
        if (orgId) {
            const { data } = await supabase.from('branches').select('id, name').eq('organization_id', orgId);
            branchIds = data?.map(b => b.id) || [];
            branches = data || [];
            if (branchIds.length === 0) {
                return { totalIncome: 0, totalExpenses: 0, totalReceivable: 0, totalGross: 0, netBalance: 0, weeklySales: [], branchPerformance: [] };
            }
        }

        let q1 = supabase.from('ticket_payments').select('amount, branch_id, created_at');
        let q2 = supabase.from('expenses').select('amount, branch_id, created_at');
        let q3 = supabase.from('tickets').select('total_amount, balance_due, branch_id, created_at');

        if (branchIds.length > 0) {
            q1 = q1.in('branch_id', branchIds);
            q2 = q2.in('branch_id', branchIds);
            q3 = q3.in('branch_id', branchIds);
        }

        if (filters?.startDate) {
            q1 = q1.gte('created_at', filters.startDate);
            q2 = q2.gte('created_at', filters.startDate);
            q3 = q3.gte('created_at', filters.startDate);
        }
        if (filters?.endDate) {
            q1 = q1.lte('created_at', filters.endDate);
            q2 = q2.lte('created_at', filters.endDate);
            q3 = q3.lte('created_at', filters.endDate);
        }

        const [{ data: payments }, { data: expenses }, { data: tickets }] = await Promise.all([q1, q2, q3]);

        const totalIncome = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
        const totalExpenses = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0;
        const totalReceivable = tickets?.reduce((acc, t) => acc + Number(t.balance_due), 0) || 0;
        const totalGross = tickets?.reduce((acc, t) => acc + Number(t.total_amount), 0) || 0;

        // Calculate Weekly Sales
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
        });

        const weeklySales = last7Days.map(dayName => {
            const dayPayments = payments?.filter(p => {
                const pDate = new Date(p.created_at).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
                return pDate === dayName;
            });
            return {
                name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                total: dayPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0
            };
        });

        // Calculate Branch Performance
        const branchPerformance = branches.map(b => {
            const bPayments = payments?.filter(p => p.branch_id === b.id);
            const bTickets = tickets?.filter(t => t.branch_id === b.id);
            return {
                id: b.id,
                shortId: b.id.substring(0, 3).toUpperCase(),
                name: b.name,
                ingresos: bPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0,
                grossSales: bTickets?.reduce((acc, t) => acc + Number(t.total_amount), 0) || 0,
                rentabilidad: 70 
            };
        });

        return {
            totalIncome,
            totalExpenses,
            totalReceivable,
            totalGross,
            netBalance: totalIncome - totalExpenses,
            weeklySales,
            branchPerformance
        };
    },

    async addPayment(notaId: string, paymentData: { amount: number, method: string, type: 'parcial' | 'liquidacion', branch_id: string }) {
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

    async updateItemStatus(itemId: string, status: string, seamstressId?: string) {
        const updateData: any = { status };
        if (seamstressId) updateData.seamstress_id = seamstressId;

        const { data: item, error: iError } = await supabase
            .from('ticket_items')
            .update(updateData)
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

    async getDailyFinancials(branch_id?: string, orgId?: string) {
        let branchIds: string[] = [];
        if (!branch_id && orgId) {
            const { data } = await supabase.from('branches').select('id').eq('organization_id', orgId);
            branchIds = data?.map(b => b.id) || [];
            if (branchIds.length === 0) return {
                income: 0, grossSales: 0, expense: 0, netCash: 0,
                breakdown: { initialCash: 0, methods: { cash: 0, card: 0, transfer: 0 }, extraIncomes: 0 }
            };
        } else if (!branch_id) {
            return null; // Need either branch or orgId
        }

        // 1. Get last non-annulled cut for branch or branches
        let cutsQuery = supabase
            .from('cash_cuts')
            .select('*')
            .neq('status', 'annulled')
            .order('end_date', { ascending: false });
        
        if (branch_id) {
            cutsQuery = cutsQuery.eq('branch_id', branch_id).limit(1);
        } else if (branchIds.length > 0) {
            cutsQuery = cutsQuery.in('branch_id', branchIds);
        }
        
        const { data: lastCuts } = await cutsQuery;

        // Default: Start of the day (safety for new branches)
        let startDate: string = new Date(new Date().setHours(0,0,0,0)).toISOString(); 
        let initialCash = 0;

        if (lastCuts && lastCuts.length > 0) {
            const cutsWithEndDate = lastCuts.filter(c => c.end_date);
            if (cutsWithEndDate.length > 0) {
                if (branch_id) {
                    // Solo una sucursal: empezar desde su último corte
                    startDate = lastCuts[0].end_date;
                } else {
                    // Múltiples sucursales: usar el más antiguo de los últimos cortes
                    const timeStamps = cutsWithEndDate.map(c => new Date(c.end_date).getTime());
                    startDate = new Date(Math.min(...timeStamps)).toISOString();
                }
            }
            initialCash = lastCuts.reduce((sum, c) => sum + (Number(c.cash_left) || 0), 0);
        } else {
            // Si no hay cortes en absoluto, empezar de cero para no perder el primer movimiento histórico
            startDate = new Date(0).toISOString();
        }

        const endDate = new Date().toISOString();

        // 2. Fetch Transactions
        let q1 = supabase.from('ticket_payments').select('amount, payment_method, payment_type').gte('created_at', startDate).lte('created_at', endDate);
        let q2 = supabase.from('expenses').select('amount, type').gte('created_at', startDate).lte('created_at', endDate);
        let q3 = supabase.from('tickets').select('total_amount').gte('created_at', startDate).lte('created_at', endDate);

        if (branch_id) {
            q1 = q1.eq('branch_id', branch_id);
            q2 = q2.eq('branch_id', branch_id);
            q3 = q3.eq('branch_id', branch_id);
        } else if (branchIds.length > 0) {
            q1 = q1.in('branch_id', branchIds);
            q2 = q2.in('branch_id', branchIds);
            q3 = q3.in('branch_id', branchIds);
        }

        const [paymentsRes, movementsRes, ticketsRes] = await Promise.all([q1, q2, q3]);

        const payments = paymentsRes.data || [];
        const movements = movementsRes.data || [];
        const tickets = ticketsRes.data || [];

        // 3. Calculate Totals (Orange/Naranja Report Logic)
        const cashSales = payments.filter(p => p.payment_method === 'efectivo').reduce((sum, p) => sum + Number(p.amount), 0);
        const cardSales = payments.filter(p => p.payment_method === 'tarjeta').reduce((sum, p) => sum + Number(p.amount), 0);
        const transferSales = payments.filter(p => p.payment_method === 'transferencia').reduce((sum, p) => sum + Number(p.amount), 0);
        
        const expensesTotal = movements.filter(m => m.type === 'expense' || !m.type).reduce((sum, m) => sum + Number(m.amount), 0);
        const incomesExtra = movements.filter(m => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0);
        
        const grossSales = tickets.reduce((sum, t) => sum + Number(t.total_amount), 0);
        const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        // Calculated Cash = (Initial + CashSales + ExtraIncomes) - Expenses
        const calculatedCash = (initialCash + cashSales + incomesExtra) - expensesTotal;

        return {
            income: totalIncome, // Real money collected (Anticipos + Liquidaciones)
            grossSales: grossSales, // Value of new notes created
            expense: expensesTotal,
            netCash: calculatedCash,
            breakdown: {
                initialCash,
                methods: {
                    cash: cashSales,
                    card: cardSales,
                    transfer: transferSales
                },
                extraIncomes: incomesExtra
            }
        };
    },

    async getActiveWorkQueue(branchId?: string, orgId?: string) {
        let branchIds: string[] = [];
        if (!branchId && orgId) {
            const { data } = await supabase.from('branches').select('id').eq('organization_id', orgId);
            branchIds = data?.map(b => b.id) || [];
            if (branchIds.length === 0) return [];
        }

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
        } else if (branchIds.length > 0) {
            query = query.in('branch_id', branchIds);
        }

        const { data, error } = await query.order('delivery_date', { ascending: true });

        if (error) throw error;

        // Normalizar items
        return data.map((t: any) => ({
            ...t,
            items: t.items || t.ticket_items || []
        }));
    }
};
