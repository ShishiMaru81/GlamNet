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
    try {
        console.log('Fetching salons...');
        const salonsRes = await makeRequest('/api/salons');
        if (!salonsRes.data || salonsRes.data.length === 0) {
            console.log('No salons found.');
            return;
        }

        console.log(`Found ${salonsRes.data.length} salons.`);

        for (const salon of salonsRes.data) {
            console.log(`--------------------------------------------------`);
            console.log(`Salon: ${salon.name}`);
            console.log(`ID: ${salon._id}`);
            console.log(`Hours: ${salon.openingTime} - ${salon.closingTime}`);

            try {
                const barbersRes = await makeRequest(`/api/salons/${salon._id}/barbers`);
                const barberCount = barbersRes.data ? barbersRes.data.length : 0;
                console.log(`Barbers: ${barberCount}`);

                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const slotsRes = await makeRequest(`/api/schedules/available?salonId=${salon._id}&date=${tomorrow}&barberId=default`);
                console.log(`Slots for Tomorrow (${tomorrow}): ${slotsRes.count || 0}`);
                if (slotsRes.count === 0 && slotsRes.message) {
                    console.log(`  Message: ${slotsRes.message}`);
                }
            } catch (e) {
                console.log(`  Error checking details: ${e.message}`);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

run();
