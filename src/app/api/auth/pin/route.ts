import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { dashboardService } from '@/features/dashboard/services/dashboardService';

export async function POST(req: Request) {
    try {
        const { pin, branchId, deviceToken } = await req.json();

        if (!pin || !branchId || !deviceToken) {
            return NextResponse.json(
                { error: 'Faltan credenciales de acceso' }, 
                { status: 400 }
            );
        }

        // 1. Validar PIN y Dispositivo vía RPC de Supabase
        // Usamos el cliente con privilegios de administrador si es necesario, 
        // pero el RPC mismo valida la seguridad.
        const result = await dashboardService.authenticateByPin(pin, branchId, deviceToken);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'PIN o Dispositivo inválido' }, 
                { status: 401 }
            );
        }

        // 2. Si es exitoso, establecemos una sesión real de Supabase 
        // para que el RLS y el middleware funcionen correctamente.
        const supabase = await createClient();
        
        // Obtenemos el usuario actual para ver si necesitamos cerrar sesión
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // Solo cerramos sesión si el usuario actual es diferente al que va a entrar
        // para evitar delays innecesarios en reconexiones rápidas.
        if (currentUser && currentUser.email !== result.profile?.email) {
            await supabase.auth.signOut();
        }
        
        if (result.profile?.email) {
            console.log(`[AUTH_PIN] Attempting sign-in for ${result.profile.email}`);
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: result.profile.email,
                password: 'Staff@2026!'
            });
            
            if (authError) {
                console.error('[AUTH_PIN_SUPABASE_ERROR]', {
                    email: result.profile.email,
                    error: authError.message,
                    status: authError.status
                });
                return NextResponse.json(
                    { error: `Error de sesión: ${authError.message}. Verifica que el usuario de Auth existe.` }, 
                    { status: 401 }
                );
            }
        } else {
             return NextResponse.json(
                { error: 'Perfil de encargado incompleto (sin email asociado)' }, 
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            user: result.profile,
            redirectUrl: '/dashboard/notas'
        });

    } catch (error: any) {
        console.error('[AUTH_PIN_ERROR]', error);
        return NextResponse.json(
            { error: 'Error interno del servidor de autenticación' }, 
            { status: 500 }
        );
    }
}
