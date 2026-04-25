-- Crear tabla de logs para la IA
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id uuid REFERENCES public.branches(id),
    client_phone text,
    user_query text,
    system_prompt text,
    ai_response text,
    ai_error text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Política para que el sistema pueda insertar
CREATE POLICY "Enable insert for authenticated users and service role" ON public.ai_logs
    FOR INSERT WITH CHECK (true);

-- Política para lectura (solo admins)
CREATE POLICY "Enable read for admins" ON public.ai_logs
    FOR SELECT USING (true);

COMMENT ON TABLE public.ai_logs IS 'Logs de interacción con el asistente de IA para depuración y mejora.';
