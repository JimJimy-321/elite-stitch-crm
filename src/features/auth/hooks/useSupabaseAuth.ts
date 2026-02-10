import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useAuthStore, UserRole } from '../store/authStore';

export function useSupabaseAuth() {
    const supabase = createClient();
    const { setUser, logout } = useAuthStore();

    useEffect(() => {
        // Obtener sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                syncUserFromSupabase(session.user.id);
            }
        });

        // Escuchar cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                syncUserFromSupabase(session.user.id);
            } else {
                logout();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const syncUserFromSupabase = async (userId: string) => {
        // Obtenemos los datos del usuario directamente de Auth (metadata) para evitar recursión RLS
        const { data: { user: authUser } } = await supabase.auth.getUser();

        const metadata = authUser?.user_metadata;

        // Si tenemos metadatos, los usamos directamente (Más rápido y seguro)
        if (metadata?.role) {
            const userData = {
                id: userId,
                full_name: metadata.full_name || authUser?.email || 'Usuario',
                email: authUser?.email || '',
                role: metadata.role as UserRole,
                organization_id: metadata.organization_id,
                assigned_branch_id: undefined // Fix: user type expects string | undefined, not null
            };

            // Fetch fresh branch ID from profiles to ensure sync
            const { data: profile } = await supabase
                .from('profiles')
                .select('assigned_branch_id')
                .eq('id', userId)
                .single();

            if (profile) {
                // Supabase returns null for empty columns, convert to undefined to match User type
                userData.assigned_branch_id = profile.assigned_branch_id || undefined;
            }

            setUser(userData);
            return userData;
        }

        // Si no hay metadatos, recurrimos a la tabla profiles (fallback)
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, role, organization_id, assigned_branch_id')
            .eq('id', userId)
            .single();

        if (profile) {
            const userData = {
                id: profile.id,
                full_name: profile.full_name,
                email: authUser?.email || '',
                role: profile.role as UserRole,
                organization_id: profile.organization_id,
                assigned_branch_id: profile.assigned_branch_id || undefined
            };
            setUser(userData);
            return userData;
        }
        return null;
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (data.user) {
            const profile = await syncUserFromSupabase(data.user.id);
            return { ...data, profile };
        }
        return data;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        logout();
    };

    return { signInWithEmail, signOut };
}
