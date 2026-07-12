const { runLicenseReminderCheck } = require('../jobs/licenseReminders.job');

async function runLicenseReminders(req, res) {
    const result = await runLicenseReminderCheck();
    return res.status(200).json(result);
}

module.exports = { runLicenseReminders };
