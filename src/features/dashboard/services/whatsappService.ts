import { toast } from "sonner";

const GRAPH_API_VERSION = 'v21.0';

export interface MetaPhoneResponse {
    id: string;
    display_phone_number: string;
    verified_name: string;
    quality_rating: string;
}

export const whatsappService = {
    /**
     * Paso 1: Agregar el número al WABA de Meta
     */
    async addPhoneToWaba(wabaId: string, accessToken: string, phoneNumber: string) {
        try {
            // Dividir número en código de país y resto
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            // Asumimos México (+52) si empieza con 52 o 10 dígitos
            const cc = cleanPhone.startsWith('52') ? '52' : '52'; 
            const number = cleanPhone.startsWith('52') ? cleanPhone.substring(2) : cleanPhone;

            const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/phone_numbers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    cc,
                    phone_number: number
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            return data.id as string; // El ID del número en Meta
        } catch (err: any) {
            console.error("Error al añadir número a Meta:", err);
            throw err;
        }
    },

    /**
     * Paso 2: Solicitar el código de verificación SMS a Meta
     */
    async requestVerificationCode(phoneId: string, accessToken: string) {
        try {
            const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    messaging_method: 'SMS',
                    locale: 'es_ES'
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            return true;
        } catch (err: any) {
            console.error("Error al solicitar SMS:", err);
            throw err;
        }
    },

    /**
     * Paso 3: Verificar el código y activar el número
     */
    async verifyCode(phoneId: string, accessToken: string, code: string) {
        if (!phoneId || phoneId.trim() === "") {
            throw new Error("Phone Number ID is required for verification.");
        }
        
        try {
            const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId.trim()}/verify_code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    code
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            return true;
        } catch (err: any) {
            console.error("Error al verificar código:", err);
            throw err;
        }
    }
};
