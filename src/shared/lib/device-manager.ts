import { v4 as uuidv4 } from 'uuid';

const DEVICE_TOKEN_KEY = 'sastrepro_device_token';

export const DeviceManager = {
    /**
     * Obtiene el token del dispositivo local. Si no existe, genera uno nuevo.
     */
    getDeviceToken: (): string => {
        if (typeof window === 'undefined') return '';
        
        let token = localStorage.getItem(DEVICE_TOKEN_KEY);
        if (!token) {
            token = uuidv4();
            localStorage.setItem(DEVICE_TOKEN_KEY, token);
        }
        return token;
    },

    /**
     * Verifica si el dispositivo tiene un token asignado.
     */
    hasToken: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(DEVICE_TOKEN_KEY);
    },

    /**
     * Genera un nombre amigable para el dispositivo basado en el User Agent.
     */
    getDeviceName: (): string => {
        if (typeof window === 'undefined') return 'Servidor';
        
        const ua = navigator.userAgent;
        let deviceName = 'Equipo Desconocido';
        
        if (ua.includes('Windows')) deviceName = 'PC Windows';
        else if (ua.includes('Macintosh')) deviceName = 'Mac';
        else if (ua.includes('iPhone')) deviceName = 'iPhone';
        else if (ua.includes('Android')) deviceName = 'Dispositivo Android';
        
        // Agregar info de navegador
        if (ua.includes('Chrome')) deviceName += ' (Chrome)';
        else if (ua.includes('Firefox')) deviceName += ' (Firefox)';
        else if (ua.includes('Safari')) deviceName += ' (Safari)';
        
        return `${deviceName} - ${new Date().toLocaleDateString()}`;
    }
};
