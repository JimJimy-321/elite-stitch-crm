import { createClient } from '@supabase/supabase-js'

// Cliente específico para Webhooks y tareas en segundo plano que no requieren sesión de usuario
// Evita el uso de cookies() que puede fallar en rutas de API públicas
// IMPORTANTE: Este cliente usa ANON_KEY. Todas las escrituras deben realizarse mediante funciones RPC 
// con SECURITY DEFINER para evitar violar el Row Level Security, ya que este cliente no maneja sesión web.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseWebhookClient = createClient(supabaseUrl, supabaseKey);
