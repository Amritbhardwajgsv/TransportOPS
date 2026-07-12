const emailService = require('../services/email.service');

const ROLE_CONTENT = {
    fleet_manager: {
        label: 'Fleet Manager',
        blurb: 'You can add and manage vehicles and drivers, dispatch trips, manage depots/cities, and view fleet-wide reports.',
    },
    driver: {
        label: 'Driver',
        blurb: 'You can view your assigned trips, their routes and cargo, and track your license status.',
    },
    safety_officer: {
        label: 'Safety Officer',
        blurb: 'You can monitor driver compliance, safety scores, and license expiries across the fleet.',
    },
    financial_analyst: {
        label: 'Financial Analyst',
        blurb: 'You can track fuel logs, expenses, and cost reports across the fleet.',
    },
};

function buildWelcomeEmailHtml(name, role) {
    const content = ROLE_CONTENT[role] || { label: role, blurb: 'Welcome aboard.' };
    return `
        <div style="font-family:sans-serif;color:#111827;">
            <h2>Welcome to TransitOps, ${name}!</h2>
            <p>Your account has been created with the role <strong>${content.label}</strong>.</p>
            <p>${content.blurb}</p>
            <p style="margin-top:16px;color:#6b7280;font-size:12px;">This is an automated message from TransitOps.</p>
        </div>
    `;
}

async function sendWelcomeEmail({ name, email, role }) {
    await emailService.sendMail({
        to: email,
        subject: 'Welcome to TransitOps',
        html: buildWelcomeEmailHtml(name, role),
    });
}

module.exports = { sendWelcomeEmail };
