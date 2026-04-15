async function listEverything() {
    const ACCESS_TOKEN = 'EAA1uVQknRMUBQzhWJX9RfZCizuZCFuFysxEXEP7caSPlX6zr1MbgdtAldObZC4GFukifFfMM6zmUv4ITelnh1IOI1zf6eric63BXZBQ59hW3AidZBLLoNSxFhHsUeIwVekZBCzGFgZCriwvccfZC9D3KKRZBVA4IirSfNyo4FhuRsZBJOgvDvD8oUwh72enlB66gZDZD';
    
    const wabas = ['1280449610662720', '3513620552124542'];
    console.log('Buscando números de las WABAs conocidas...');
    try {
        for (const wabaId of wabas) {
            console.log(`\nBuscando números para WABA ${wabaId}...`);
            const phoneRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`, {
                headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
            });
            const phoneData = await phoneRes.json();
            console.log(JSON.stringify(phoneData, null, 2));
        }
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

listEverything();
