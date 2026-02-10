
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIntegrity() {
    console.log("🔒 Starting Integrity Verification Test...");

    try {
        // 1. Create Test Client
        console.log("1️⃣ Creating Test Client...");
        const { data: client, error: cError } = await supabase
            .from('clients')
            .insert({
                full_name: "TEST_INTEGRITY_CLIENT_" + Date.now(),
                phone: "5555555555",
                organization_id: "00000000-0000-0000-0000-000000000000" // Default org
            })
            .select()
            .single();

        if (cError) throw new Error(`Failed to create client: ${cError.message}`);
        console.log("✅ Client Created:", client.id);

        // 2. Create Active Ticket (Simulating dashboardService logic)
        console.log("2️⃣ Creating Active Ticket...");
        const { data: ticket, error: tError } = await supabase
            .from('tickets')
            .insert({
                ticket_number: `TEST-${Date.now()}`,
                branch_id: "e5f8a0b1-c4d3-4e2f-a0b1-c4d34e2fa0b1", // Assuming a valid branch ID exists or using one from DB
                client_id: client.id,
                delivery_date: new Date().toISOString(),
                notes: "Test Integrity Ticket",
                total_amount: 100,
                balance_due: 100,
                status: 'received'
            })
            .select()
            .single();

        // If branch_id constraint fails, allow it to fail to know we need a real ID
        if (tError) {
            console.warn("⚠️  Could not create ticket (likely invalid branch_id). Fetching a valid branch...");
            const { data: branch } = await supabase.from('branches').select('id').limit(1).single();
            if (branch) {
                const { data: ticket2, error: tError2 } = await supabase
                    .from('tickets')
                    .insert({
                        ticket_number: `TEST-${Date.now()}`,
                        branch_id: branch.id,
                        client_id: client.id,
                        delivery_date: new Date().toISOString(),
                        notes: "Test Integrity Ticket",
                        total_amount: 100,
                        balance_due: 100,
                        status: 'received'
                    })
                    .select()
                    .single();
                if (tError2) throw new Error(`Failed to create ticket: ${tError2.message}`);
                console.log("✅ Ticket Created with valid branch:", ticket2.id);
            } else {
                throw new Error("No branches found to create ticket.");
            }
        } else {
            console.log("✅ Ticket Created:", ticket.id);
        }

        // 3. Try Delete Client (Refplicating dashboardService.deleteClient Logic)
        console.log("3️⃣ Attempting Delete Client (Should FAIL via App Logic)...");

        // App Logic Check
        const { data: activeTickets } = await supabase
            .from('tickets')
            .select('id')
            .eq('client_id', client.id)
            .neq('status', 'delivered');

        if (activeTickets && activeTickets.length > 0) {
            console.log("✅ SUCCESS: App Logic blocked deletion correctly.");
        } else {
            console.error("❌ FAIL: App Logic did NOT block deletion!");
        }

        // 4. Force Delete (Bypassing App Logic to test DB Constraint)
        console.log("4️⃣ Attempting Direct DB Delete (Should FAIL via DB Constraint)...");
        const { error: dError } = await supabase
            .from('clients')
            .delete()
            .eq('id', client.id);

        if (dError) {
            console.log("✅ SUCCESS: DB Constraint blocked deletion:", dError.message);
        } else {
            console.error("❌ FAIL: DB Constraint did NOT block deletion! Client was deleted.");
        }

        // Cleanup if it wasn't deleted (expected)
        if (!dError) {
            // It was deleted, so we are in bad state.
        } else {
            // Cleanup ticket then client
            console.log("🧹 Cleaning up...");
            // We need to find the ticket ID again if we lost it in scope, but we have `ticket` or `ticket2`
            const { data: tickets } = await supabase.from('tickets').select('id').eq('client_id', client.id);
            if (tickets) {
                for (const t of tickets) {
                    await supabase.from('tickets').delete().eq('id', t.id);
                }
            }
            await supabase.from('clients').delete().eq('id', client.id);
            console.log("✅ Cleanup complete.");
        }

    } catch (err) {
        console.error("❌ Test Error:", err);
        process.exit(1);
    }
}

testIntegrity();
