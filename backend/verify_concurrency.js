const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const appointmentController = require('./controllers/appointmentController');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Mock Request and Response
class MockReq {
    constructor(body, user) {
        this.body = body;
        this.user = user;
    }
}

class MockRes {
    constructor(resolve) {
        this.resolve = resolve;
        this.statusCode = 200;
        this.jsonData = {};
    }

    status(code) {
        this.statusCode = code;
        return this;
    }

    json(data) {
        this.jsonData = data;
        this.resolve({ status: this.statusCode, data: this.jsonData });
        return this;
    }
}

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const Customer = require('./models/Customer');
        const Barber = require('./models/Barber');
        const Salon = require('./models/Salon');
        const Service = require('./models/Service');
        const User = require('./models/User'); // Assuming User model exists for Auth

        // 1. Setup Data
        // Find existing or create placeholder data to use
        const existingSalon = await Salon.findOne();
        if (!existingSalon) throw new Error('No Salon found. Please seed DB first.');

        const existingBarber = await Barber.findOne({ salonId: existingSalon._id });
        if (!existingBarber) throw new Error('No Barber found for the salon.');

        const existingService = await Service.findOne({ salonId: existingSalon._id });
        if (!existingService) throw new Error('No Service found for the salon.');

        // Get a real user ID linked to a customer, or find a customer
        const customer = await Customer.findOne().populate('userId');
        if (!customer) throw new Error('No Customer found.');

        // 2. Prepare Request Data
        // Generate a future date/time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0); // 2:00 PM tomorrow

        // Use a virtual slot ID to trigger the creation logic too
        const startTime = "14:00";
        const virtualSlotId = `virtual-${startTime}`;

        const reqBody = {
            barberId: existingBarber._id.toString(),
            salonId: existingSalon._id.toString(),
            serviceId: existingService._id.toString(),
            scheduleSlotId: virtualSlotId,
            appointmentDateTime: tomorrow.toISOString(),
            notes: "Concurrency Test"
        };

        const mockUser = {
            id: customer.userId._id.toString(), // The User ID, not Customer ID
            role: 'customer'
        };

        console.log(`\n--- Starting Concurrency Test ---`);
        console.log(`Targeting Slot: ${virtualSlotId} on ${tomorrow.toISOString()}`);
        console.log(`Barber: ${existingBarber._id}`);

        // Cleanup: Delete any existing slots/appointments for this time to ensure fresh test
        await mongoose.connection.collection('scheduleslots').deleteMany({
            barberId: existingBarber._id,
            date: tomorrow,
            startTime: startTime
        });
        console.log("Cleanup: Removed existing slots for target time.");

        // 3. Launch Concurrent Requests
        const numRequests = 5;
        console.log(`Launching ${numRequests} concurrent requests...`);

        const promises = [];
        for (let i = 0; i < numRequests; i++) {
            promises.push(new Promise((resolve) => {
                const req = new MockReq(reqBody, mockUser);
                const res = new MockRes(resolve);
                // Call the controller
                appointmentController.createAppointment(req, res, (err) => {
                    console.error("Next called with error:", err);
                    resolve({ status: 500, error: err });
                });
            }));
        }

        const results = await Promise.all(promises);

        // 4. Analyze Results
        let successCount = 0;
        let failCount = 0;
        let alreadyBookedCount = 0;

        results.forEach((res, index) => {
            if (res.status === 201) {
                successCount++;
                console.log(`Request ${index + 1}: SUCCESS - Appointment ID: ${res.data.data._id}`);
            } else {
                failCount++;
                console.log(`Request ${index + 1}: FAILED (${res.status}) - ${res.data.message}`);
                if (res.data.message && res.data.message.includes('already booked')) {
                    alreadyBookedCount++;
                }
            }
        });

        console.log(`\n--- Results ---`);
        console.log(`Successful Bookings: ${successCount}`);
        console.log(`Failed Bookings: ${failCount}`);
        console.log(`'Already Booked' Errors: ${alreadyBookedCount}`);

        if (successCount === 1 && failCount === numRequests - 1) {
            console.log("\n✅ VERIFICATION PASSED: Double booking prevented!");
        } else {
            console.log("\n❌ VERIFICATION FAILED: Unexpected results.");
        }

    } catch (error) {
        console.error("Verification Script Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

runVerification();
