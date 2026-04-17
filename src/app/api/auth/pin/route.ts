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

        // 2. Si es exitoso, necesitamos establecer la sesión de Supabase
        // NOTA: Como estamos usando una autenticación custom (PIN), s
        // se asume que el RPC verificó todo. Para "loguear" al usuario en el cliente,
        // podríamos usar el session_token devuelto si el RPC lo genera, o 
        // realizar un login administrativo.
        
        // OPCIÓN: Si el RPC devolviera un JWT válido, lo establecemos.
        // Por ahora, redirigimos al dashboard con la intención de que el middleware 
        // o un estado local reconozca la "sesión de terminal".
        
        return NextResponse.json({
            success: true,
            user: result.profile,
            redirectUrl: '/dashboard'
        });

    } catch (error: any) {
        console.error('[AUTH_PIN_ERROR]', error);
        return NextResponse.json(
            { error: 'Error interno del servidor de autenticación' }, 
            { status: 500 }
        );
    }
}
