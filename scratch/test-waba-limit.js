const wabaId = '1280449610662720';
const token = 'EAA1uVQknRMUBQzhWJX9RfZCizuZCFuFysxEXEP7caSPlX6zr1MbgdtAldObZC4GFukifFfMM6zmUv4ITelnh1IOI1zf6eric63BXZBQ59hW3AidZBLLoNSxFhHsUeIwVekZBCzGFgZCriwvccfZC9D3KKRZBVA4IirSfNyo4FhuRsZBJOgvDvD8oUwh72enlB66gZDZD';
fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?access_token=${token}`)
.then(r=>r.json()).then(j=>console.log(JSON.stringify(j, null, 2)));
