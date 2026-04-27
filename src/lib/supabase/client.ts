import { createBrowserClient } from '@supabase/ssr'

// Función para obtener/generar un ID de pestaña único para aislamiento
const getTabId = () => {
    if (typeof window === 'undefined') return 'default';
    let id = sessionStorage.getItem('sastrepro-tab-id');
    if (!id) {
        id = Math.random().toString(36).substring(7);
        sessionStorage.setItem('sastrepro-tab-id', id);
    }
    return id;
};

export function createClient() {
  const tabId = getTabId();
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1];
  const cookieName = projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      auth: {
        // Usamos una clave de almacenamiento única por pestaña para evitar la sincronización automática (BroadcastChannel)
        storageKey: `sb-auth-token-${tabId}`,
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      cookieOptions: {
        // Mantenemos el nombre de la cookie estándar para que el Middleware pueda validar la sesión
        name: cookieName,
      }
    }
  )
}
