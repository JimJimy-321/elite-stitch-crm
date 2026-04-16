const phoneId = '1090070170857969';
const token = 'EAA1uVQknRMUBQzhWJX9RfZCizuZCFuFysxEXEP7caSPlX6zr1MbgdtAldObZC4GFukifFfMM6zmUv4ITelnh1IOI1zf6eric63BXZBQ59hW3AidZBLLoNSxFhHsUeIwVekZBCzGFgZCriwvccfZC9D3KKRZBVA4IirSfNyo4FhuRsZBJOgvDvD8oUwh72enlB66gZDZD';

async function run() {
  const dRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_method: 'SMS', locale: 'es_ES' })
  });
  console.log(await dRes.json());
}
run();
