const fs = require('fs');
const { Pool } = require('pg');

const caPath = process.env.DB_SSL_CA_PATH;

const pool = new Pool({
    // host/port/database/user/password fall back to PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD
    ssl: caPath
        ? { ca: fs.readFileSync(caPath).toString(), rejectUnauthorized: true }
        : undefined,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(1);
});

module.exports = pool;
