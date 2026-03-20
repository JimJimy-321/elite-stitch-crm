
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usamos service role para saltar RLS en la prueba técnica

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('PONER_AQUI')) {
    console.error('❌ Error: Configura las variables NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateWebhook(phone: string, text: string) {
    console.log(`🚀 Simulando mensaje de WhatsApp de ${phone}: "${text}"`);

    try {
        const { data, error } = await supabase.rpc('process_incoming_whatsapp', {
            p_phone: phone,
            p_content: text,
            p_phone_number_id: '1040167799184428', // ID de prueba del env
            p_media_url: null,
            p_media_type: null
        });

        if (error) {
            console.error('❌ Error en el RPC:', error);
        } else {
            console.log('✅ Webhook procesado con éxito:', data);
        }
    } catch (err) {
        console.error('💥 Error inesperado:', err);
    }
}

// Ejecutar prueba
const testPhone = '5214421205583';
const testMessage = 'Prueba de validación técnica SastrePro - Webhook OK ' + new Date().toLocaleTimeString();

simulateWebhook(testPhone, testMessage);
