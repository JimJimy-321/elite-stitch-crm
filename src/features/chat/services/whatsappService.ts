import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const WHATSAPP_VERSION = 'v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const whatsappService = {
    /**
     * Normaliza un número de teléfono para Meta
     */
    normalizePhoneNumber(phone: string): string {
        let clean = phone.replace(/\D/g, '');

        if (clean.startsWith('52')) {
            if (clean.length === 13 && clean.startsWith('521')) {
                return clean.replace('521', '52');
            }
            const suffix = clean.substring(2);
            if (suffix.length === 10) return clean;
        }

        try {
            const parsed = parsePhoneNumber('+' + clean);
            if (parsed && isValidPhoneNumber(parsed.number)) {
                return parsed.number.replace('+', '');
            }
        } catch (e) {
            console.warn('Normalization failed:', clean);
        }

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
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return { success: false, error };
        }
    },

    /**
     * Envía un mensaje con multimedia
     */
    async sendMediaMessage(to: string, mediaUrl: string, type: 'image' | 'document' | 'video' | 'audio', caption?: string) {
        if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            return { success: false, error: 'Configuración de WhatsApp incompleta' };
        }

        const normalizedTo = this.normalizePhoneNumber(to);
        const url = `https://graph.facebook.com/${WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`;

        const body: any = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalizedTo,
            type: type,
        };

        body[type] = { link: mediaUrl };
        if (caption && (type === 'image' || type === 'video' || type === 'document')) {
            body[type].caption = caption;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error };
        }
    },

    /**
     * Envía una plantilla
     */
    async sendTemplateMessage(to: string, templateName: string = 'hello_world', languageCode: string = 'en_US') {
        if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
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
            return { success: false, error };
        }
    }
};
