import { createClient } from './src/lib/supabase/server';

async function test() {
    const supabase = await createClient();
    const { data: cut } = await supabase.from('cash_cuts').select('*').order('created_at', { ascending: false }).limit(1).single();
    
    if (!cut) return console.log('No cut');

    const { data: payments, error } = await supabase
        .from('ticket_payments')
        .select(`
            id,
            amount,
            payment_method,
            payment_type,
            created_at,
            is_deposit,
            ticket:tickets(ticket_number, client:clients(full_name))
        `)
        .gte('created_at', cut.start_date)
        .lte('created_at', cut.end_date);

    console.log('Payments Error:', error);
    console.log('Payments Count:', payments?.length);
    console.log('First Payment:', payments?.[0]);

    const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('branch_id', cut.branch_id)
        .gte('created_at', cut.start_date)
        .lte('created_at', cut.end_date);

    console.log('Expenses Count:', expenses?.length);
}

test();
