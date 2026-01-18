const express = require('express');
const { Resend } = require('resend');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Allow GitHub Pages domain and local testing
const allowedOrigins = [
    'https://aleenavarghese29.github.io',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(bodyParser.json());

// Initialize Resend with API Key from environment variables
// Make sure to add RESEND_API_KEY in your Render Dashboard
const resend = new Resend(process.env.RESEND_API_KEY);

// Basic Root Route
app.get('/', (req, res) => {
    res.send('Portfolio Backend is running with Resend!');
});

// API Endpoint for sending emails
app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const { data, error } = await resend.emails.send({
            // Use 'onboarding@resend.dev' for testing if you haven't verified a domain yet.
            // For production with a custom domain, change this to 'contact@yourdomain.com'
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: process.env.EMAIL_TO,
            reply_to: email,
            subject: `[Portfolio] New Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">New Portfolio Inquiry</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
                </div>
            `
        });

        if (error) {
            console.error('Resend API Error:', error);
            return res.status(500).json({ success: false, message: 'Failed to send email: ' + error.message });
        }

        console.log(`Email sent successfully via Resend. ID: ${data.id}`);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (err) {
        console.error('Server Internal Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
