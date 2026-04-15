async function listPhoneNumbers() {
    const WABA_ID = '1280449610662720';
    const ACCESS_TOKEN = 'EAA1uVQknRMUBQzhWJX9RfZCizuZCFuFysxEXEP7caSPlX6zr1MbgdtAldObZC4GFukifFfMM6zmUv4ITelnh1IOI1zf6eric63BXZBQ59hW3AidZBLLoNSxFhHsUeIwVekZBCzGFgZCriwvccfZC9D3KKRZBVA4IirSfNyo4FhuRsZBJOgvDvD8oUwh72enlB66gZDZD';
    const url = `https://graph.facebook.com/v21.0/${WABA_ID}/phone_numbers`;

    console.log(`Buscando números de teléfono para WABA: ${WABA_ID}...`);
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });
        const data = await response.json();
        console.log('--- RESULTADOS META ---');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

listPhoneNumbers();
