import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { whatsappService } from './whatsappService';
import { generateText } from 'ai';
import { createGoogleGenerativeAI, google as defaultGoogle } from '@ai-sdk/google';

/**
 * AI Assistant Service - SastrePro
 * Maneja la lógica de respuestas automáticas e inteligentes.
 */
export const aiAssistantService = {
    /**
     * Detecta si un mensaje requiere intervención de la IA
     */
    shouldRespond(content: string): boolean {
        const lower = content.toLowerCase();
        // Respondemos a casi todo si el asistente está activo, 
        // pero priorizamos flujos específicos.
        return lower.length > 1;
    },

    /**
     * Procesa la consulta del cliente y genera una respuesta basada en datos reales
     */
    async handleIncoming(phone: string, content: string, phoneNumberId: string, whatsappId?: string) {
        if (!this.shouldRespond(content)) return null;

        // 0. Prevención de Duplicados (Idempotencia)
        if (whatsappId) {
            const { data: existing } = await supabase
                .from('chat_messages')
                .select('id')
                .contains('metadata', { whatsapp_id: whatsappId })
                .limit(1);

            if (existing && existing.length > 0) {
                console.log(`[AI_ASSISTANT] Mensaje duplicado ignorado: ${whatsappId}`);
                return null;
            }
        }

        console.log(`[AI_ASSISTANT] Procesando consulta para: ${phone}`);

        try {
            // 1. Obtener Configuración Dinámica del Agente
            const { data: agentConfig } = await supabase
                .from('agent_configs')
                .select('*')
                .eq('phone_number_id', phoneNumberId)
                .eq('is_active', true)
                .single();

            // 1.1 Obtener Datos de la Sucursal para contexto extra
            const { data: branch, error: bErr } = await supabase
                .from('branches')
                .select('id, wa_access_token, wa_phone_number_id, metadata, organization_id, name, business_hours, address')
                .eq('wa_phone_number_id', phoneNumberId)
                .single();

            if (bErr || !branch) {
                console.error('[AI_ASSISTANT] Branch not found for ID:', phoneNumberId, bErr);
                return null;
            }

            // Verificar si el asistente está activo (ya sea en metadata o en la nueva tabla)
            const aiEnabled = agentConfig?.is_active ?? (branch.metadata?.ai_enabled !== false); 
            if (!aiEnabled) return null;

            // 2. Buscar Cliente por teléfono
            const { data: clients, error: cErr } = await supabase.rpc('get_client_by_phone_secure', {
                p_phone: phone,
                p_org_id: branch.organization_id,
                p_branch_id: branch.id
            });

            const client = clients?.[0];

            if (cErr || !client) {
                console.log(`[AI_ASSISTANT] Cliente no identificado para: ${phone}`);
                // Podríamos generar una respuesta genérica aquí o derivar a humano
                return await this.handleHandoff(phone, branch, "CLIENTE NO IDENTIFICADO");
            }

            // 3. Lógica de Decisión: ¿Es consulta de estatus o general?
            const isStatusQuery = ['estatus', 'status', 'pedido', 'orden', 'mi ropa', 'listo', 'entrega', 'deuda', 'cuanto debo', 'saldo'].some(k => content.toLowerCase().includes(k));

            if (isStatusQuery) {
                return await this.respondStatus(phone, client, branch, content);
            }

            // 4. Consulta General (IA Inteligente con Gemini)
            return await this.respondGeneral(phone, client, branch, content, agentConfig);

        } catch (error) {
            console.error('[AI_ASSISTANT] Critical Error:', error);
            return null;
        }
    },

    /**
     * Responde a consultas de estatus de pedidos usando la nueva lógica de IA Inteligente (Fase 8)
     */
    async respondStatus(phone: string, client: any, branch: any, originalQuery: string) {
        const { aiStatusService } = await import('./aiStatusService');
        
        const smartResponse = await aiStatusService.getSmartStatus(
            client.id, 
            branch.id, 
            originalQuery, 
            client.full_name
        );

        if (!smartResponse) {
            // Fallback en caso de error en el servicio de IA
            const fallbackMsg = `HOLA ${client.full_name}! 👋 ESTOY BUSCANDO LA INFORMACION DE TUS PEDIDOS, PERO TARDARE UN MOMENTO MAS. UN ENCARGADO TE ATENDERA SI TIENES DUDAS URGENTES.`;
            return await this.sendAndLog(phone, fallbackMsg, client.id, branch);
        }

        return await this.sendAndLog(phone, smartResponse, client.id, branch);
    },

    /**
     * Respuesta genérica / inteligente usando Gemini
     */
    async respondGeneral(phone: string, client: any, branch: any, content: string, agentConfig?: any) {
        try {
            // 1. Obtener contexto del catálogo de servicios
            const { data: services } = await supabase
                .from('service_catalogs')
                .select('name, price, category')
                .eq('organization_id', branch.organization_id)
                .is('deleted_at', null);

            const servicesContext = services?.map(s => `- ${s.name}: $${s.price}${s.category ? ` (${s.category})` : ''}`).join('\n') || 'Información de precios no disponible temporalmente.';

            // 3. Obtener Conocimiento Personalizado
            const customKnowledge = agentConfig?.knowledge_base || '';
            const customSystemPrompt = agentConfig?.system_prompt || `Eres el Asistente IA de "${branch.name}", una sastrería profesional de alta costura.`;

            // 4. Construir Prompt del Sistema Enriquecido
            const systemPrompt = `Eres el asistente virtual experto de Elite Stitch CRM (Sastrería).
Tu principal objetivo es entablar una conversación amigable, descubrir qué necesita el cliente, y persuadirlo sutilmente para que traiga sus prendas a reparar a nuestra sastrería o adquiera alguno de nuestros servicios.

DATOS DE LA SUCURSAL:
- Nombre: ${branch.name}
- Dirección: ${branch.address || 'No especificada'}
- Horarios: ${JSON.stringify(branch.business_hours || 'Lunes a Viernes 9am-7pm, Sábados 9am-2pm')}

BASE DE CONOCIMIENTO EXTRA:
${customKnowledge}

CATÁLOGO DE SERVICIOS Y PRECIOS:
${servicesContext}

INSTRUCCIONES DE RESPUESTA:
1. Responde de forma cálida, persuasiva y concisa (máximo 1-2 párrafos cortos).
2. Si el cliente solo saluda (ej. "Hola"), salúdalo por su nombre (${client.full_name}), preséntate e invítalo a contarte cómo puedes ayudarle a renovar o ajustar sus prendas hoy.
3. Si preguntan por precios, usa el catálogo. Si no está o es complejo, invítalos a la sucursal para una valoración sin compromiso.
4. Siempre mantén una actitud orientada a la venta y a ofrecer soluciones de costura de alta calidad.
5. Responde SIEMPRE en español.`;

            // 3. Verificación y Configuración de API Key
            const apiKey = agentConfig?.google_api_key || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

            if (!apiKey) {
                console.error('[AI_ASSISTANT] ERROR: Missing Gemini API Key');
                await supabase.rpc('log_webhook_payload', {
                    p_payload: { 
                        diagnostics: 'AI_DIAGNOSTICS',
                        error: 'Gemini API Key is missing (neither in DB nor in Env)',
                        context: 'aiAssistantService.respondGeneral'
                    }
                });
                throw new Error('Missing Google AI API Key');
            }

            // Crear el modelo con la llave detectada
            const googleProvider = createGoogleGenerativeAI({
                apiKey: apiKey
            });

            // 4. Generar respuesta con Gemini
            const { text } = await generateText({
                model: googleProvider('gemini-2.5-flash') as any,
                system: systemPrompt,
                prompt: content,
            });

            if (!text) throw new Error('No response from AI');

            // 4. Enviamos la respuesta generada
            return await this.sendAndLog(phone, text, client.id, branch);

        } catch (error) {
            console.error('[AI_ASSISTANT_GEMINI] Error Generando Texto:', error);
            
            // Loguear error para diagnóstico en DB
            await supabase.rpc('log_webhook_payload', {
                p_payload: { 
                    type: 'AI_ERROR',
                    error: error instanceof Error ? error.message : String(error),
                    phone,
                    content
                }
            });

            // Fallback a handoff si la IA falla
            return await this.handleHandoff(phone, branch, content, client.id, client.full_name);
        }
    },

    /**
     * Marca la conversación para atención humana
     */
    async handleHandoff(phone: string, branch: any, content: string, clientId?: string, clientName?: string) {
        console.log(`[AI_ASSISTANT] Handoff requerido para: ${phone}`);
        
        // Si tenemos cliente, actualizamos su conversación a 'pending'
        if (clientId) {
            await this.markForHuman(clientId, branch.id, "FAILED_OR_COMPLEX");
        }

        // Si la IA falló por completo, enviamos un mensaje de espera
        const fallbackMsg = `Hola ${clientName || 'Estimado Cliente'}, le enviaré su solicitud al encargado de la sucursal, permítame un momento por favor, gracias.`;
        return await this.sendAndLog(phone, fallbackMsg, clientId || '', branch);
    },

    /**
     * Helper para marcar una conversación como que necesita atención humana
     */
    async markForHuman(clientId: string, branchId: string, reason: string) {
        try {
            await supabase
                .from('chat_conversations')
                .update({ 
                    metadata: { 
                        needs_human: true, 
                        last_ai_handoff: new Date().toISOString(),
                        handoff_reason: reason
                    }
                })
                .eq('client_id', clientId)
                .eq('branch_id', branchId);
        } catch (err) {
            console.error('[AI_ASSISTANT] Error marking for human:', err);
        }
    },

    /**
     * Helper para enviar el mensaje por WhatsApp y registrarlo usando la RPC segura
     */
    async sendAndLog(phone: string, text: string, clientId: string, branch: any) {
        // 1. Enviar vía API de Meta
        const sendResult = await whatsappService.sendTextMessage(
            phone,
            text,
            { accessToken: branch.wa_access_token, phoneNumberId: branch.wa_phone_number_id }
        );

        if (!sendResult.success) {
            console.error('[AI_ASSISTANT] Error enviando WhatsApp:', sendResult.error);
            return null;
        }

        // 2. Registrar en DB usando la RPC log_bot_message (Bypasses RLS)
        const { error: logError } = await supabase.rpc('log_bot_message', {
            p_client_id: clientId,
            p_branch_id: branch.id,
            p_content: text,
            p_whatsapp_id: sendResult.data?.messages?.[0]?.id || null
        });

        if (logError) {
            console.error('[AI_ASSISTANT] Error registrando mensaje del bot:', logError);
        }

        return sendResult;
    }
};
