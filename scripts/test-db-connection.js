require('dotenv').config();
const pool = require('../src/config/db');

async function main() {
    try {
        const result = await pool.query('SELECT version()');
        console.log('Connected. Server version:');
        console.log(result.rows[0].version);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();
