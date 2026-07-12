const pool = require('../config/db');

const SELECT_COLUMNS = `
    id, name, license_number, license_expiry, safety_score, status, photo, created_at, updated_at,
    (license_expiry < CURRENT_DATE) AS is_expired,
    (license_expiry - CURRENT_DATE) AS days_until_expiry
`;

async function listDrivers({ search, status, excludeExpired }) {
    const conditions = [];
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        conditions.push(`(name ILIKE $${params.length} OR license_number ILIKE $${params.length})`);
    }
    if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }
    if (excludeExpired) {
        conditions.push('license_expiry >= CURRENT_DATE');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
        `SELECT ${SELECT_COLUMNS} FROM drivers ${where} ORDER BY license_expiry ASC`,
        params
    );
    return result.rows;
}

async function findDriverById(id) {
    const result = await pool.query(`SELECT ${SELECT_COLUMNS} FROM drivers WHERE id = $1`, [id]);
    return result.rows[0];
}

async function createDriver({ name, licenseNumber, licenseExpiry, safetyScore, photo }) {
    const result = await pool.query(
        `INSERT INTO drivers (name, license_number, license_expiry, safety_score, photo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, license_number, license_expiry, safety_score, status, photo, created_at, updated_at`,
        [name, licenseNumber, licenseExpiry, safetyScore ?? 100, photo ?? null]
    );
    return result.rows[0];
}

async function updateDriver(id, { name, licenseNumber, licenseExpiry, safetyScore, photo }) {
    const result = await pool.query(
        `UPDATE drivers
         SET name = $1, license_number = $2, license_expiry = $3, safety_score = $4, photo = $5, updated_at = now()
         WHERE id = $6
         RETURNING id, name, license_number, license_expiry, safety_score, status, photo, created_at, updated_at`,
        [name, licenseNumber, licenseExpiry, safetyScore, photo ?? null, id]
    );
    return result.rows[0];
}

async function setDriverStatus(id, status, client = pool) {
    const result = await client.query(
        `UPDATE drivers SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0];
}

module.exports = { listDrivers, findDriverById, createDriver, updateDriver, setDriverStatus };
