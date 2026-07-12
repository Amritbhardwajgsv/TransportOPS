const pool = require('../config/db');

const SELECT_COLUMNS = `
    f.id, f.liters, f.cost, f.odometer_km, f.logged_at, f.created_at,
    f.vehicle_id, v.registration_number AS vehicle_registration
`;
const BASE_JOIN = `FROM fuel_logs f JOIN vehicles v ON v.id = f.vehicle_id`;

async function listFuelLogs({ vehicleId, limit }) {
    const conditions = [];
    const params = [];
    if (vehicleId) {
        params.push(vehicleId);
        conditions.push(`f.vehicle_id = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = limit ? `LIMIT ${Number(limit)}` : '';
    const result = await pool.query(
        `SELECT ${SELECT_COLUMNS} ${BASE_JOIN} ${where} ORDER BY f.logged_at DESC ${limitClause}`,
        params
    );
    return result.rows;
}

async function createFuelLog({ vehicleId, liters, cost, odometerKm }) {
    const result = await pool.query(
        `INSERT INTO fuel_logs (vehicle_id, liters, cost, odometer_km) VALUES ($1, $2, $3, $4) RETURNING id`,
        [vehicleId, liters, cost, odometerKm ?? null]
    );
    const created = await pool.query(`SELECT ${SELECT_COLUMNS} ${BASE_JOIN} WHERE f.id = $1`, [result.rows[0].id]);
    return created.rows[0];
}

async function totalCostByVehicle() {
    const result = await pool.query(
        `SELECT vehicle_id, COALESCE(SUM(cost), 0) AS total_cost, COALESCE(SUM(liters), 0) AS total_liters
         FROM fuel_logs GROUP BY vehicle_id`
    );
    return result.rows;
}

module.exports = { listFuelLogs, createFuelLog, totalCostByVehicle };
