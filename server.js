require('dotenv').config();

const cron = require('node-cron');
const app = require('./src/app');
const pool = require('./src/config/db');
const redisClient = require('./src/config/redis');
const { runLicenseReminderCheck } = require('./src/jobs/licenseReminders.job');

const PORT = process.env.PORT || 8080;

async function start() {
    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connected');

        await redisClient.connect();
        console.log('Redis connected');

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });

        // Daily at 8am server time: email Safety Officers about expiring/expired driver licenses
        cron.schedule('0 8 * * *', () => {
            runLicenseReminderCheck().catch((err) => console.error('License reminder job failed:', err));
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
