import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Rutas públicas que no requieren autenticación
    const isPublicPath = path === '/login' || path === '/';

    // Obtener el ID del proyecto desde la URL de Supabase para construir el nombre de la cookie
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = supabaseUrl.split('.')[0].split('//')[1] || 'rbhvjqcyczgaanwphhjr';

    // Buscar la cookie de autenticación de Supabase basada en el ID dinámico
    const authToken = request.cookies.get(`sb-${projectId}-auth-token`);

    // Si no hay token y está intentando acceder a ruta protegida
    if (!authToken && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si tiene token y está en login, redirigir a dashboard
    if (authToken && path === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
