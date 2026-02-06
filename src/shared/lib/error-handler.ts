export const errorTranslations: Record<string, string> = {
    "NEW ROW VIOLATES ROW-LEVEL SECURITY POLICY FOR TABLE \"ORGANIZATIONS\"": "Error de Permisos: No tienes autorización para crear una organización (RLS).",
    "NEW ROW VIOLATES ROW-LEVEL SECURITY POLICY FOR TABLE \"PROFILES\"": "Error de Permisos: No tienes autorización para crear este perfil de usuario.",
    "duplicate key value violates unique constraint \"profiles_email_key\"": "Este correo electrónico ya está registrado en el sistema.",
    "duplicate key value violates unique constraint \"users_email_key\"": "Este correo electrónico ya está registrado en Supabase Auth.",
    "Invalid login credentials": "Credenciales de acceso inválidas. Verifica tu correo y contraseña.",
    "Database error querying schema": "Error crítico: Fallo al consultar el esquema de la base de datos.",
    "JWT expired": "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
    "User already exists": "El usuario ya existe.",
    "duplicate key value violates unique constraint \"unique_client_phone_org\"": "Este número de teléfono ya está registrado con otro cliente.",
};

export function translateError(error: any): string {
    if (!error) return "Ocurrió un error inesperado.";

    const message = typeof error === 'string' ? error : (error.message || error.toString());

    // Búsqueda parcial de coincidencias
    for (const [key, translation] of Object.entries(errorTranslations)) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
            return translation;
        }
    }

    // Errores de red o Supabase genéricos
    if (message.includes('fetch')) return "Error de conexión: No se pudo contactar con el servidor.";

    return message || "Error desconocido. Por favor intenta de nuevo.";
}
