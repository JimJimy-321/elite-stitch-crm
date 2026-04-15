

async function sendTestMessage(branchName, conversationId, phone, content) {
    console.log(`\n[TEST] Enviando mensaje desde ${branchName} a ${phone}...`);
    try {
        const response = await fetch('http://localhost:3000/api/chat/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId,
                phone,
                content
            })
        });
        
        const data = await response.json();
        console.log(`[TEST] Resultado de ${branchName}:`, response.status, data.success ? 'EXITO' : 'FALLO');
        if (!data.success) {
            console.log(`   Razón: ${data.error} - ${data.message || ''}`);
        } else {
            console.log(`   Message ID:`, data.waData?.messages?.[0]?.id);
        }
        return data;
    } catch (e) {
        console.error(`[TEST] Error fatal en ${branchName}:`, e.message);
    }
}

async function runTests() {
    // 1. Sede Central -> +525521410491 (Conversacion c956d47c-3d7d-490a-bc20-a4b54dbdd53a)
    await sendTestMessage(
        'Sede Central Elite', 
        'c956d47c-3d7d-490a-bc20-a4b54dbdd53a', 
        '+525521410491', 
        '👑 PRUEBA REAL (Sede Central): Verificando conectividad aislada.'
    );

    console.log('\n--- Esperando 2 segundos ---\n');
    await new Promise(r => setTimeout(r, 2000));

    // 2. El Refugio -> +525512345678 (Conversacion 480eb453-bc72-4a7d-ad68-f986ca4ef2f8)
    await sendTestMessage(
        'El Refugio', 
        '480eb453-bc72-4a7d-ad68-f986ca4ef2f8', 
        '+525512345678', 
        '🏁 PRUEBA REAL (El Refugio): Debería fallar por estar incompleto y NO secuestrar Sede Central.'
    );
}

runTests();
