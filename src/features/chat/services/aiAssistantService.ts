import { supabaseWebhookClient as supabase } from '@/lib/supabase/webhook';
import { whatsappService } from './whatsappService';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

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

        // 0. Prevenci\u00f3n de Duplicados (Idempotencia)
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
            // 1. Obtener Configuraraci\u00f3n Din\u00e1mica del Agente
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

            // Verificar si el asistente est\u00e1 activo (ya sea en metadata o en la nueva tabla)
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
            const fallbackMsg = `HOLA ${client.full_name}! 👋 ESTOY BUSCANDO LA INFORMACI\u00D3N DE TUS PEDIDOS, PERO TARDAR\u00C9 UN MOMENTO M\u00C1S. UN ENCARGADO TE ATENDER\u00C1 SI TIENES DUDAS URGENTES.`;
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
            const customSystemPrompt = agentConfig?.system_prompt || `Eres el Asistente IA de "${branch.name}", una sastrer\u00eda profesional de alta costura.`;

            // 4. Construir Prompt del Sistema Enriquecido
            const systemPrompt = `${customSystemPrompt}

OBJETIVO: 
Ser amable, eficiente y profesional. Conversa con el cliente de forma natural. 
NO digas "perm\u00edtame un momento" o "le enviar\u00e9 su solicitud" a menos que sea estrictamente necesario (ej: quejas graves). 
Intenta siempre resolver la duda t\u00fa primero.

CONTEXTO DE LA SUCURSAL:
- Sucursal: ${branch.name}
- Direcci\u00f3n: ${branch.address || 'Favor de preguntar por este canal'}
- Horarios: ${JSON.stringify(branch.business_hours || 'Lunes a Viernes 9am-7pm, S\u00e1bados 9am-2pm')}

BASE DE CONOCIMIENTO EXTRA:
${customKnowledge}

CAT\u00c1LOGO DE SERVICIOS Y PRECIOS:
${servicesContext}

INSTRUCCIONES DE RESPUESTA:
1. Responde de forma concisa (m\u00e1ximo 2-3 p\u00e1rrafos cortos).
2. Si preguntan por precios, usa el cat\u00e1logo. Si no est\u00e1, indica que necesitas ver la prenda para cotizar.
3. El cliente se llama ${client.full_name}.
4. Si el cliente parece enojado o satisfecho, adapta tu tono.
5. Responde SIEMPRE en espa\u00f1ol.`;

            // 3. Generar respuesta con Gemini
            const { text } = await generateText({
                model: google('gemini-2.0-flash-001') as any,
                system: systemPrompt,
                prompt: content,
            });

            if (!text) throw new Error('No response from AI');

            // 4. Detección de Handoff en el texto generado
            const handoffLower = text.toLowerCase();
            const needsHuman = handoffLower.includes('encargado') || 
                              handoffLower.includes('pronto') || 
                              handoffLower.includes('paciencia') || 
                              handoffLower.includes('atender');

            if (needsHuman) {
                console.log(`[AI_ASSISTANT] Handoff detectado en respuesta de IA para: ${phone}`);
                await this.markForHuman(client.id, branch.id, "AI_SUGGESTED_HANDOFF");
            }

            return await this.sendAndLog(phone, text, client.id, branch);

        } catch (error) {
            console.error('[AI_ASSISTANT_GEMINI] Error:', error);
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

        // Si la IA fall\u00f3 por completo, enviamos un mensaje de espera
        const fallbackMsg = `Hola ${clientName || 'Estimado Cliente'}, le enviar\u00e9 su solicitud al encargado de la sucursal, perm\u00edtame un momento por favor, gracias.`;
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
            p_whatsapp_id: sendResult.data?.messages?.[0]?.id || null,
            p_metadata: {
                ai_generated: true,
                whatsapp_id: sendResult.data?.messages?.[0]?.id
            }
        });

        if (logError) {
            console.error('[AI_ASSISTANT] Error registrando mensaje del bot:', logError);
        }

        return sendResult;
    }
};

