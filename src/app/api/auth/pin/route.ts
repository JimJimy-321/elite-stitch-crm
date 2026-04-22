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
        
        if (result.profile?.email) {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: result.profile.email,
                password: 'Staff@2026!'
            });
            
            if (authError) {
                console.error('[AUTH_PIN_SUPABASE_ERROR]', authError);
                return NextResponse.json(
                    { error: 'Error al establecer sesión segura' }, 
                    { status: 500 }
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
