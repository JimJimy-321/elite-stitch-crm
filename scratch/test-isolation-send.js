
const conversationSedeId = 'c956d47c-3d7d-490a-bc20-a4b54dbdd53a';
const conversationRefugioId = '8f10f2de-b70f-4b70-a2eb-5907ada55dd1';
const targetPhone = '5215521410491';

async function testSend(convId, label) {
    console.log(`Testing ${label}...`);
    const res = await fetch('http://localhost:3000/api/chat/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversationId: convId,
            content: `PRUEBA AUTOMATIZADA - Validando aislamiento desde ${label}`,
            phone: targetPhone
        })
    });
    const data = await res.json();
    console.log(`${label} result:`, data.success ? 'Success' : 'Fail', data.error || '');
}

async function run() {
    await testSend(conversationSedeId, 'Sede Central');
    await testSend(conversationRefugioId, 'El Refugio');
}

run();
