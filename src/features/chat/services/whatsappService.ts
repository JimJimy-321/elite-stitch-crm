/**
 * WhatsApp Service - Maneja la comunicación con la Cloud API de Meta
 */

const WHATSAPP_VERSION = 'v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const whatsappService = {
    /**
     * Envía un mensaje de texto simple
     */
    async sendTextMessage(to: string, text: string) {
        if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.error('WhatsApp configuration missing');
            return { success: false, error: 'Configuración de WhatsApp incompleta' };
        }

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
                    to: to.replace(/\D/g, ''),
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
     * Envía una plantilla (necesario para iniciar conversaciones después de 24h)
     */
    async sendTemplateMessage(to: string, templateName: string = 'hello_world', languageCode: string = 'en_US') {
        if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.error('WhatsApp configuration missing');
            return { success: false, error: 'Configuración de WhatsApp incompleta' };
        }

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
                    to: to.replace(/\D/g, ''),
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
