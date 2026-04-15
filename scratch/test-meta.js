async function run() {
    const GRAPH_API_VERSION = 'v21.0';
    const wabaId = '1280449610662720';
    const accessToken = 'EAA1uVQknRMUBQzhWJX9RfZCizuZCFuFysxEXEP7caSPlX6zr1MbgdtAldObZC4GFukifFfMM6zmUv4ITelnh1IOI1zf6eric63BXZBQ59hW3AidZBLLoNSxFhHsUeIwVekZBCzGFgZCriwvccfZC9D3KKRZBVA4IirSfNyo4FhuRsZBJOgvDvD8oUwh72enlB66gZDZD';
    const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/phone_numbers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            cc: '52',
            phone_number: '5578437260',
            verified_name: 'SastrePro Sede'
        })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
