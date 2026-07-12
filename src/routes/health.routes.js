const router = require('express').Router();
const pool = require('../config/db');
const redisClient = require('../config/redis');

router.get('/', async (req, res) => {
    let db = 'unreachable';
    let redis = 'unreachable';

    try {
        await pool.query('SELECT 1');
        db = 'connected';
    } catch (err) {
        console.error('Health check: db unreachable', err);
    }

    try {
        await redisClient.ping();
        redis = 'connected';
    } catch (err) {
        console.error('Health check: redis unreachable', err);
    }

    res.json({ status: 'ok', db, redis });
});

module.exports = router;
