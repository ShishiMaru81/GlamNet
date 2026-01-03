const dotenv = require('dotenv');
const path = require('path');
// Load env vars FIRST
dotenv.config({ path: path.join(__dirname, '../.env') });

const sendEmail = require('./utils/email');

const testEmail = async () => {
    console.log(`Checking config...`);
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);

    try {
        console.log('Sending test email...');
        await sendEmail({
            email: process.env.EMAIL_USER, // Send to self
            subject: 'GlamNet Email Verification',
            message: 'If you are reading this, the email feature is working correctly!',
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email failed:', error);
    }
};

testEmail();
