import { createClient } from '@supabase/supabase-js'

// Cliente específico para Webhooks y tareas en segundo plano que no requieren sesión de usuario
// Evita el uso de cookies() que puede fallar en rutas de API públicas
// IMPORTANTE: Utilizar SUPABASE_SERVICE_ROLE_KEY para saltar RLS en procesos de servidor
export const supabaseWebhookClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
