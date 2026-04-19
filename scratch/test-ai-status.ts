import { aiAssistantService } from '../src/features/chat/services/aiAssistantService';
import { whatsappService } from '../src/features/chat/services/whatsappService';

// Mocking whatsappService.sendTextMessage to avoid real API calls
const originalSend = whatsappService.sendTextMessage;
let interceptedContent = "";

whatsappService.sendTextMessage = async (to, text, config) => {
    interceptedContent = text;
    console.log(`[MOCK_WHATSAPP] Enviando a ${to}:`);
    console.log("-----------------------------------------");
    console.log(text);
    console.log("-----------------------------------------");
    return { success: true, data: { messages: [{ id: "mock_id" }] } };
};

async function testAI() {
    console.log("🤖 Iniciando Test de IA Resolutiva (Status Query)");

    // Datos del cliente real encontrado en DB (JUAN CENTRAL)
    const testPhone = "525521410491";
    const testContent = "¿Cómo va mi pedido?";
    const testPhoneId = "1090070170857969";

    await aiAssistantService.handleIncoming(testPhone, testContent, testPhoneId);

    if (interceptedContent.includes("JUAN CENTRAL") && interceptedContent.includes("Orden")) {
        console.log("✅ TEST EXITOSO: La IA identificó al cliente y sus órdenes.");
    } else {
        console.error("❌ TEST FALLIDO: La respuesta no contiene los datos esperados.");
        console.log("Contenido recibido:", interceptedContent);
    }
}

testAI().catch(console.error);
