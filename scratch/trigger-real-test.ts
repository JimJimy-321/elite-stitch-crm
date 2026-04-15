async function sendTestMessage(branchName, conversationId, phone, content) {
    console.log(`[TEST] Enviando mensaje desde ${branchName} a ${phone}...`);
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
        console.log(`[TEST] Resultado de ${branchName}:`, response.status, data.success ? 'EXITO' : 'FALLO', data.error || '');
        return data;
    } catch (e) {
        console.error(`[TEST] Error fatal en ${branchName}:`, e.message);
    }
}

async function runTests() {
    // 1. El Refugio -> +525521410491
    await sendTestMessage(
        'El Refugio', 
        '5df2c0af-883a-423e-8f06-5155ec9b82c1', 
        '+525521410491', 
        '🏁 PRUEBA REAL: Este es un mensaje de SastrePro desde la sucursal EL REFUGIO. Por favor confirma si lo recibiste.'
    );

    console.log('\n--- Esperando 2 segundos ---\n');
    await new Promise(r => setTimeout(r, 2000));

    // 2. Sede Central -> +525578437260
    await sendTestMessage(
        'Sede Central', 
        '207c056b-117f-4fa6-9440-ff3e1d3c25a9', 
        '+525578437260', 
        '👑 PRUEBA REAL: Este es un mensaje de SastrePro desde la SEDE CENTRAL. Por favor confirma si lo recibiste.'
    );
}

runTests();
