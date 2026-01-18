const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */

// ✅ CORS — allow GitHub Pages explicitly
app.use(cors({
    origin: 'https://aleenavarghese29.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// ✅ Parse JSON bodies
app.use(express.json());

/* =========================
   SMTP CONFIG
========================= */

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // required for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});


/* =========================
   ROUTES
========================= */

// Health check
app.get('/', (req, res) => {
    res.send('Portfolio Backend is running successfully!');
});

// Contact form endpoint
app.post('/send-email', async (req, res) => {
    console.log('🔥 /send-email endpoint hit');
    console.log('Request body:', req.body);

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required.'
        });
    }

    const mailOptions = {
        from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        replyTo: email,
        subject: `[Portfolio] New Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>New Portfolio Message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr />
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully');

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('❌ Email error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to send message.'
        });
    }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
