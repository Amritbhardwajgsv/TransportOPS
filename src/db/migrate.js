require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        console.log(`Running migration: ${file}`);
        await pool.query(sql);
    }

    console.log('Migrations complete');
    await pool.end();
    process.exit(0);
}

runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
