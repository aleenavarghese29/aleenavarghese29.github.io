const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Allow only your GitHub Pages domain and local testing
const allowedOrigins = [
    'https://aleenavarghese29.github.io',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(bodyParser.json());

// SMTP Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Basic Root Route to check if server is running
app.get('/', (req, res) => {
    res.send('Portfolio Backend is running successfully!');
});

// API Endpoint
app.post('/send-email', async (req, res) => {
    console.log('/send-email endpoint was called');
    console.log('Request body:', req.body);


    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // SPAM PREVENTION:
    // 1. "From" must be the authenticated user (you), otherwise it looks like spoofing.
    // 2. "Reply-To" is set to the visitor's email so you can hit reply directly.
    const mailOptions = {
        from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        replyTo: email, // <--- This allows you to reply to the sender
        subject: `[Portfolio] New Message from ${name}`,
        text: `You have received a new message from your portfolio website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully for ${name}`);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
