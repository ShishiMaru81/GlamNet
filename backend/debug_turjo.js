const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        http.get({
            hostname: 'localhost',
            port: 5000,
            path: path,
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function run() {
    const salonId = '694e18b621fc380dde6538ee'; // Turjo420
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Deep debug for Salon: ${salonId} on ${tomorrow}`);

    try {
        // 1. Check Salon Details
        const salonRes = await makeRequest(`/api/salons/${salonId}`);
        console.log('Salon Data:', JSON.stringify(salonRes, null, 2));

        // 2. Check Barbers
        const barbersRes = await makeRequest(`/api/salons/${salonId}/barbers`);
        console.log('Barbers Data:', JSON.stringify(barbersRes, null, 2));

        // 3. Check Slots with verbose logging (WE CAN'T ENABLE VERBOSE LOGGING IN SERVER, so we simulate)
        // ... well we can rely on standard api call again to confirm 0
        const slotsRes = await makeRequest(`/api/schedules/available?salonId=${salonId}&date=${tomorrow}&barberId=default`);
        console.log('Slots Response:', JSON.stringify(slotsRes, null, 2));

    } catch (e) {
        console.error(e);
    }
}

run();
