const wabaId = '1280449610662720';
const token = 'EAA1uVQknRMUBQzhWJX9RfZCizuZCFuFysxEXEP7caSPlX6zr1MbgdtAldObZC4GFukifFfMM6zmUv4ITelnh1IOI1zf6eric63BXZBQ59hW3AidZBLLoNSxFhHsUeIwVekZBCzGFgZCriwvccfZC9D3KKRZBVA4IirSfNyo4FhuRsZBJOgvDvD8oUwh72enlB66gZDZD';

async function run() {
  const res = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Numbers:', data);
  
  const targetNumber = data.data.find(n => n.display_phone_number && n.display_phone_number.includes('5578437260'));
  if (targetNumber) {
    console.log('Found number ID to delete/deregister:', targetNumber.id);
    
    // Primero, intentar deregister
    const dRes = await fetch(`https://graph.facebook.com/v21.0/${targetNumber.id}/deregister`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('Deregister response:', await dRes.json());
    
    // Luego, intentar DELETE si existe
    const delRes = await fetch(`https://graph.facebook.com/v21.0/${targetNumber.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Delete response:', await delRes.json());
    
  } else {
    console.log('Number 5578437260 not found in WABA.');
  }

  // Veamos cuantos numeros hay ahora
  const res2 = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Remaining Numbers:', (await res2.json()).data.map?.(d => d.display_phone_number));
}
run().catch(console.error);
