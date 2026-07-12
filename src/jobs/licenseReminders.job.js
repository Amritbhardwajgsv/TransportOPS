const driverModel = require('../models/driver.model');
const userModel = require('../models/user.model');
const emailService = require('../services/email.service');

const REMINDER_WINDOW_DAYS = 30;

function buildEmailHtml(drivers) {
    const rows = drivers
        .map((d) => {
            const daysLeft = Number(d.days_until_expiry);
            const statusLabel = d.is_expired
                ? `<span style="color:#dc2626;font-weight:600;">Expired ${Math.abs(daysLeft)} day(s) ago</span>`
                : `<span style="color:#d97706;font-weight:600;">Expires in ${daysLeft} day(s)</span>`;
            return `<tr>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${d.name}</td>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${d.license_number}</td>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${new Date(d.license_expiry).toLocaleDateString()}</td>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${statusLabel}</td>
            </tr>`;
        })
        .join('');

    return `
        <div style="font-family:sans-serif;color:#111827;">
            <h2>Driver License Expiry Report</h2>
            <p>The following ${drivers.length} driver(s) have licenses expired or expiring within ${REMINDER_WINDOW_DAYS} days:</p>
            <table style="border-collapse:collapse;width:100%;max-width:640px;">
                <thead>
                    <tr style="background:#f3f4f6;text-align:left;">
                        <th style="padding:8px;">Driver</th>
                        <th style="padding:8px;">License #</th>
                        <th style="padding:8px;">Expiry date</th>
                        <th style="padding:8px;">Status</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <p style="margin-top:16px;color:#6b7280;font-size:12px;">Automated reminder from TransitOps.</p>
        </div>
    `;
}

async function runLicenseReminderCheck() {
    const drivers = await driverModel.listExpiringLicenses(REMINDER_WINDOW_DAYS);
    if (drivers.length === 0) {
        return { sent: false, driverCount: 0, recipientCount: 0 };
    }

    const safetyOfficers = await userModel.findUsersByRole('safety_officer');
    if (safetyOfficers.length === 0) {
        return { sent: false, driverCount: drivers.length, recipientCount: 0 };
    }

    const html = buildEmailHtml(drivers);
    await emailService.sendMail({
        to: safetyOfficers.map((u) => u.email).join(','),
        subject: `TransitOps: ${drivers.length} driver license(s) need attention`,
        html,
    });

    return { sent: true, driverCount: drivers.length, recipientCount: safetyOfficers.length };
}

module.exports = { runLicenseReminderCheck, REMINDER_WINDOW_DAYS };
