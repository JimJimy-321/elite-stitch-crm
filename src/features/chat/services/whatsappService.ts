import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const WHATSAPP_VERSION = 'v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const whatsappService = {
    /**
     * Normaliza un número de teléfono para Meta
     * En México, Meta a veces rechaza el '1' después del '52' o viceversa.
     * La regla general es: 10 dígitos después del código de país.
     */
    normalizePhoneNumber(phone: string): string {
        // Eliminar todo lo que no sea número
        let clean = phone.replace(/\D/g, '');

        // Si empieza con 52 y tiene 11 o 12 dígitos (México con/sin el 1)
        if (clean.startsWith('52')) {
            // Caso 521XXXXXXXXXX (13 dígitos) -> 52XXXXXXXXXX (12 dígitos)
            if (clean.length === 13 && clean.startsWith('521')) {
                return clean.replace('521', '52');
            }
            // Asegurar que si tiene 10 dígitos extras, es el formato correcto
            const suffix = clean.substring(2);
            if (suffix.length === 10) return clean;
        }

        try {
            const parsed = parsePhoneNumber('+' + clean);
            if (parsed && isValidPhoneNumber(parsed.number)) {
                return parsed.number.replace('+', '');
            }
        } catch (e) {
            console.warn('Normalization failed, using raw digits:', clean);
        }

        console.log(`Normalizando: ${phone} -> ${clean} (final: ${clean})`);
        return clean;
    },

    /**
     * Envía un mensaje de texto simple
     */
    async sendTextMessage(to: string, text: string) {
        if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.error('WhatsApp configuration missing');
            return { success: false, error: 'Configuración de WhatsApp incompleta' };
        }

        const normalizedTo = this.normalizePhoneNumber(to);
        const url = `https://graph.facebook.com/${WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`;

        try {
            console.log(`[WHATSAPP_TRACE] Enviando mensaje a ${normalizedTo}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: normalizedTo,
                    type: 'text',
                    text: { body: text },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Meta API Error:', JSON.stringify(data, null, 2));
                return { success: false, error: data.error?.message || 'Error en API de Meta', data };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return { success: false, error };
        }
    },

    /**
     * Envía una plantilla (necesario para iniciar conversaciones después de 24h)
     */
    async sendTemplateMessage(to: string, templateName: string = 'hello_world', languageCode: string = 'en_US') {
        if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.error('WhatsApp configuration missing');
            return { success: false, error: 'Configuración de WhatsApp incompleta' };
        }

        const normalizedTo = this.normalizePhoneNumber(to);
        const url = `https://graph.facebook.com/${WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: normalizedTo,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: languageCode,
                        },
                    },
                }),
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error sending WhatsApp template:', error);
            return { success: false, error };
        }
    }
};
