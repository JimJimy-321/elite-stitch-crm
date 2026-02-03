import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

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
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, role, organization_id')
            .eq('id', userId)
            .single();

        if (profile) {
            const { data: authUser } = await supabase.auth.getUser();
            setUser({
                id: profile.id,
                name: profile.full_name,
                email: authUser.user?.email || '',
                role: mapSupabaseRole(profile.role),
            });
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (data.user) {
            await syncUserFromSupabase(data.user.id);
        }
        return data;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        logout();
    };

    return { signInWithEmail, signOut };
}

// Mapear roles de Supabase (super_admin) a frontend (superadmin)
function mapSupabaseRole(role: string): 'superadmin' | 'owner' | 'manager' {
    if (role === 'super_admin') return 'superadmin';
    return role as 'owner' | 'manager';
}
