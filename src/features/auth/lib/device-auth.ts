import { nanoid } from 'nanoid';

const DEVICE_TOKEN_KEY = 'sp_device_auth_token';
const AUTHORIZED_BRANCH_KEY = 'sp_authorized_branch';

/**
 * Genera una huella digital del hardware (Fingerprint)
 * Combina datos del navegador para crear un ID semi-permanente
 */
export const getDeviceFingerprint = async (): Promise<string> => {
    if (typeof window === 'undefined') return '';

    const data = [
        navigator.userAgent,
        window.screen.width,
        window.screen.height,
        navigator.language,
        new Date().getTimezoneOffset()
    ].join('|');

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Gestiona el Token de Autorización (el que se guarda tras RPC authorize_device)
 */
export const saveDeviceToken = (token: string) => {
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
};

export const getDeviceToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(DEVICE_TOKEN_KEY);
};

/**
 * Nombre amigable del equipo para mostrar al usuario
 */
export const getDeviceFriendlyName = () => {
    if (typeof window === 'undefined') return 'Servidor';
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Computadora Windows';
    if (ua.includes('Macintosh')) return 'Computadora Mac';
    if (ua.includes('Linux')) return 'Computadora Linux';
    return 'Dispositivo Genérico';
};

/**
 * Guarda la sucursal autorizada localmente tras verificación
 */
export const setAuthorizedBranch = (branchId: string, branchName: string) => {
    localStorage.setItem(AUTHORIZED_BRANCH_KEY, JSON.stringify({ id: branchId, name: branchName }));
};

/**
 * Obtiene la sucursal autorizada para este dispositivo
 */
export const getAuthorizedBranch = (): { id: string; name: string } | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTHORIZED_BRANCH_KEY);
    return data ? JSON.parse(data) : null;
};
