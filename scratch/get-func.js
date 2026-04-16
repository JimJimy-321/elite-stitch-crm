const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getFunc() {
    const { data, error } = await supabase.rpc('execute_sql_query', { 
        query: "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'process_incoming_whatsapp' LIMIT 1" 
    });
    if (error) console.error(error);
    else console.log(data);
}
// getFunc();
