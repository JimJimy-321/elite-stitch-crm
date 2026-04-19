import { createClient } from '@supabase/supabase-js';

// Environment variables will be loaded via --env-file flag in tsx

const supabaseUrl = "https://rbhvjqcyczgaanwphhjr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHZqcWN5Y3pnYWFud3BoaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNTA3MTEsImV4cCI6MjA4NDYyNjcxMX0.1HAM2uVa58W4xLWdWTF9HyJpowoqxnr0zHib6_gKjgk";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIntegrity() {
  console.log("🧪 Iniciando Test de Integridad: deleteClient");

  const orgId = "2b1558d8-1e71-48a6-899b-93e50220ee21"; // Cinthia Monterrubio Org
  const branchId = "d061c40d-1a1a-4bdd-971e-dfcc10f4d6de"; // Sucursal Polanco

  try {
    // 1. Crear Cliente de Prueba
    console.log("1. Creando cliente de prueba...");
    const { data: client, error: cErr } = await supabase
      .from('clients')
      .insert({
        full_name: "CLIENTE TEST INTEGRIDAD",
        phone: "5500000000",
        organization_id: orgId,
        last_branch_id: branchId
      })
      .select()
      .single();

    if (cErr) throw cErr;
    console.log("✅ Cliente creado:", client.id);

    // 2. Crear Ticket Activo
    console.log("2. Creando ticket activo (balance_due > 0)...");
    const { data: ticket, error: tErr } = await supabase
      .from('tickets')
      .insert({
        ticket_number: "T-TEST-QA",
        branch_id: branchId,
        client_id: client.id,
        total_amount: 500,
        balance_due: 500,
        status: 'received'
      })
      .select()
      .single();

    if (tErr) throw tErr;
    console.log("✅ Ticket creado:", ticket.id);

    // 3. Intentar eliminar (Debe fallar por lógica de aplicación)
    // Nota: Como este script es directo a DB, vamos a emular lo que hace dashboardService
    console.log("3. Intentando eliminar cliente con ticket activo...");
    
    // Simular dashboardService.deleteClient logic
    const { data: active } = await supabase
      .from('tickets')
      .select('id')
      .eq('client_id', client.id)
      .or('status.neq.delivered,balance_due.gt.0');

    if (active && active.length > 0) {
      console.log("✅ RESULTADO ESPERADO: Eliminación bloqueada por lógica.");
    } else {
      console.error("❌ ERROR: La lógica no detectó el ticket activo.");
    }

    // 4. Intentar eliminar en DB (Debe fallar por FK RESTRICT si se configuró)
    console.log("4. Intentando eliminar directamente en DB (FK check)...");
    const { error: dErr } = await supabase
      .from('clients')
      .delete()
      .eq('id', client.id);

    if (dErr && dErr.code === '23503') {
      console.log("✅ RESULTADO ESPERADO: DB protegió la integridad referencial (RESTRICT).");
    } else if (!dErr) {
       console.error("❌ CRÍTICO: El cliente fue borrado! No hay protección RESTRICT.");
    } else {
       console.error("❌ Error inesperado:", dErr);
    }

    // Limpieza (Opcional, pero si el borrado falló, el cliente sigue ahí)
    if (!dErr) {
        console.log("Limpiando ticket...");
        await supabase.from('tickets').delete().eq('id', ticket.id);
        await supabase.from('clients').delete().eq('id', client.id);
    }

  } catch (error) {
    console.error("❌ Test Fallido:", error);
  }
}

testIntegrity();
