const Salon = { openingTime: '09:00', closingTime: '21:00' };

// Mock inputs
const dateStr = '2025-12-27'; // User picks tomorrow
const now = new Date('2025-12-26T12:25:00+06:00'); // User's current time

// Simulate Controller Logic
const startOfDay = new Date(dateStr);
startOfDay.setHours(0, 0, 0, 0);

const bufferTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);

console.log('Now:', now.toISOString());
console.log('Buffer Time (Now + 12h):', bufferTime.toISOString());
console.log('Selected Date StartOfDay:', startOfDay.toISOString());

let [openHour, openMin] = Salon.openingTime.split(':').map(Number);
const [closeHour, closeMin] = Salon.closingTime.split(':').map(Number);

let currentHour = openHour;
let currentMin = openMin;

console.log('--- Generating Slots ---');

while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
    const nextMin = (currentMin + 30) % 60;
    const nextHour = currentHour + Math.floor((currentMin + 30) / 60);

    const startTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

    // THE LOGIC
    const slotStartTime = new Date(startOfDay);
    slotStartTime.setHours(currentHour, currentMin, 0, 0);

    const isFiltered = slotStartTime < bufferTime;

    console.log(`Slot ${startTimeStr}: ${slotStartTime.toISOString()} < ${bufferTime.toISOString()} ? ${isFiltered ? 'FILTERED' : 'VISIBLE'}`);

    if (slotStartTime < bufferTime) {
        currentHour = nextHour;
        currentMin = nextMin;
        continue;
    }

    currentHour = nextHour;
    currentMin = nextMin;
}
