const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }
    return transporter;
}

async function sendMail({ to, subject, html }) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD are not configured');
    }
    return getTransporter().sendMail({
        from: `TransitOps <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
}

module.exports = { sendMail };
