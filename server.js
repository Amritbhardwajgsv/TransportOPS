require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');
const redisClient = require('./src/config/redis');

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
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
