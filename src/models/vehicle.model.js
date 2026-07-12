const pool = require('../config/db');

async function listVehicles({ search, status }) {
    const conditions = [];
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        conditions.push(`(registration_number ILIKE $${params.length} OR model ILIKE $${params.length})`);
    }
    if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
        `SELECT * FROM vehicles ${where} ORDER BY created_at DESC`,
        params
    );
    return result.rows;
}

async function findVehicleById(id) {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    return result.rows[0];
}

async function createVehicle({ registrationNumber, model, type, maxLoadKg, odometerKm, acquisitionCost, photo }) {
    const result = await pool.query(
        `INSERT INTO vehicles (registration_number, model, type, max_load_kg, odometer_km, acquisition_cost, photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [registrationNumber, model, type, maxLoadKg, odometerKm ?? 0, acquisitionCost ?? null, photo ?? null]
    );
    return result.rows[0];
}

async function updateVehicle(id, { registrationNumber, model, type, maxLoadKg, odometerKm, acquisitionCost, photo }) {
    const result = await pool.query(
        `UPDATE vehicles
         SET registration_number = $1, model = $2, type = $3, max_load_kg = $4,
             odometer_km = $5, acquisition_cost = $6, photo = $7, updated_at = now()
         WHERE id = $8
         RETURNING *`,
        [registrationNumber, model, type, maxLoadKg, odometerKm, acquisitionCost ?? null, photo ?? null, id]
    );
    return result.rows[0];
}

async function setVehicleStatus(id, status, client = pool) {
    const result = await client.query(
        `UPDATE vehicles SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0];
}

async function setVehicleOdometer(id, odometerKm, client = pool) {
    const result = await client.query(
        `UPDATE vehicles SET odometer_km = $1, updated_at = now() WHERE id = $2 RETURNING *`,
        [odometerKm, id]
    );
    return result.rows[0];
}

module.exports = {
    listVehicles,
    findVehicleById,
    createVehicle,
    updateVehicle,
    setVehicleStatus,
    setVehicleOdometer,
};
