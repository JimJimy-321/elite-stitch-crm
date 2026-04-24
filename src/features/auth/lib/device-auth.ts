/**
 * Utilidades para la autenticación y huella digital del dispositivo (SastrePro)
 * UNIFICADO: Consolida lib/device-auth y utils/device-auth
 */

export const DEVICE_TOKEN_KEY = 'sp_device_auth_token';
export const AUTHORIZED_BRANCH_KEY = 'sp_authorized_branch';

/**
 * Genera una huella digital determinista basada en el navegador/hardware
 */
export async function getDeviceFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return '';

    const nab = window.navigator;
    const screen = window.screen;
    
    const components = [
        nab.userAgent,
        nab.language,
        nab.platform || 'unknown',
        nab.hardwareConcurrency || 'unknown'
    ];
    
    const msgUint8 = new TextEncoder().encode(components.join('|'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Obtiene el token de dispositivo guardado
 */
export function getDeviceToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(DEVICE_TOKEN_KEY);
}

// Alias para compatibilidad
export const getSavedDeviceToken = getDeviceToken;

/**
 * Guarda el token de dispositivo
 */
export function saveDeviceToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
}

/**
 * Genera un ID amigable para el dispositivo basado en el navegador
 */
export function getDeviceFriendlyName(): string {
    if (typeof window === 'undefined') return 'Servidor';
    const ua = window.navigator.userAgent;
    if (ua.includes('Chrome')) return 'Google Chrome Terminal';
    if (ua.includes('Firefox')) return 'Firefox Terminal';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Apple Terminal';
    if (ua.includes('Edge')) return 'Microsoft Edge Terminal';
    
    // Fallback amigable por SO
    if (ua.includes('Windows')) return 'Computadora Windows';
    if (ua.includes('Macintosh')) return 'Computadora Mac';
    if (ua.includes('Linux')) return 'Computadora Linux';
    
    return 'Generic Web Terminal';
}

/**
 * Guarda la sucursal autorizada localmente tras verificación
 */
export function setAuthorizedBranch(branchId: string, branchName: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTHORIZED_BRANCH_KEY, JSON.stringify({ id: branchId, name: branchName }));
}

/**
 * Obtiene la sucursal autorizada para este dispositivo
 */
export function getAuthorizedBranch(): { id: string; name: string } | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTHORIZED_BRANCH_KEY);
    try {
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Limpia la autorización del dispositivo
 */
export function clearDeviceAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DEVICE_TOKEN_KEY);
    localStorage.removeItem(AUTHORIZED_BRANCH_KEY);
}
