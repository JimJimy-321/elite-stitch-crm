import { createClient } from '@supabase/supabase-js'

// Cliente específico para Webhooks y tareas en segundo plano que no requieren sesión de usuario
// Evita el uso de cookies() que puede fallar en rutas de API públicas
// IMPORTANTE: Utiliza SUPABASE_SERVICE_ROLE_KEY para saltar RLS. 
// Usamos un fallback a ANON_KEY solo para evitar que falle el build si la variable no está presente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseWebhookClient = createClient(supabaseUrl, supabaseKey);
