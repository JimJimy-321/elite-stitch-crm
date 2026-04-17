/**
 * Utilidades para la autenticación y huella digital del dispositivo (SastrePro)
 */

export const DEVICE_TOKEN_KEY = 'sp_device_auth_token';

/**
 * Genera una huella digital determinista basada en el navegador/hardware
 * Esto no es 100% infalible pero sirve para el propósito de "Terminal de Sucursal"
 */
export async function getDeviceFingerprint(): Promise<string> {
    const nab = window.navigator;
    const screen = window.screen;
    const components = [
        nab.userAgent,
        nab.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        nab.platform,
        nab.hardwareConcurrency
    ];
    
    const msgUint8 = new TextEncoder().encode(components.join('|'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

/**
 * Obtiene el token de dispositivo guardado
 */
export function getSavedDeviceToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(DEVICE_TOKEN_KEY);
}

/**
 * Guarda el token de dispositivo (proporcionado por el backend tras autorización)
 */
export function saveDeviceToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
}

/**
 * Genera un ID amigable para el dispositivo basado en el navegador
 */
export function getDeviceFriendlyName(): string {
    const ua = window.navigator.userAgent;
    if (ua.includes('Chrome')) return 'Google Chrome Terminal';
    if (ua.includes('Firefox')) return 'Firefox Terminal';
    if (ua.includes('Safari')) return 'Safari Apple Terminal';
    if (ua.includes('Edge')) return 'Microsoft Edge Terminal';
    return 'Generic Web Terminal';
}
