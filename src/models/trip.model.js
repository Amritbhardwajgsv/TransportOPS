const pool = require('../config/db');

const SELECT_COLUMNS = `
    t.id, t.seq, ('TR-' || LPAD(t.seq::text, 3, '0')) AS trip_number,
    t.source, t.destination, t.cargo_weight_kg, t.planned_distance_km, t.status,
    t.start_odometer_km, t.end_odometer_km, t.fuel_consumed_liters,
    t.dispatched_at, t.completed_at, t.created_at, t.updated_at,
    t.vehicle_id, v.registration_number AS vehicle_registration, v.model AS vehicle_model,
    t.driver_id, d.name AS driver_name
`;

const BASE_JOIN = `
    FROM trips t
    JOIN vehicles v ON v.id = t.vehicle_id
    JOIN drivers d ON d.id = t.driver_id
`;

async function listTrips({ status }) {
    const conditions = [];
    const params = [];
    if (status) {
        params.push(status);
        conditions.push(`t.status = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT ${SELECT_COLUMNS} ${BASE_JOIN} ${where} ORDER BY t.created_at DESC`, params);
    return result.rows;
}

async function findTripById(id, client = pool) {
    const result = await client.query(`SELECT ${SELECT_COLUMNS} ${BASE_JOIN} WHERE t.id = $1`, [id]);
    return result.rows[0];
}

async function createTrip({ source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm }, client = pool) {
    const result = await client.query(
        `INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm ?? null]
    );
    return findTripById(result.rows[0].id, client);
}

async function markDispatched(id, startOdometerKm, client = pool) {
    await client.query(
        `UPDATE trips SET status = 'dispatched', start_odometer_km = $1, dispatched_at = now(), updated_at = now() WHERE id = $2`,
        [startOdometerKm, id]
    );
    return findTripById(id, client);
}

async function markCompleted(id, { endOdometerKm, fuelConsumedLiters }, client = pool) {
    await client.query(
        `UPDATE trips
         SET status = 'completed', end_odometer_km = $1, fuel_consumed_liters = $2, completed_at = now(), updated_at = now()
         WHERE id = $3`,
        [endOdometerKm, fuelConsumedLiters ?? null, id]
    );
    return findTripById(id, client);
}

async function markCancelled(id, client = pool) {
    await client.query(`UPDATE trips SET status = 'cancelled', updated_at = now() WHERE id = $1`, [id]);
    return findTripById(id, client);
}

module.exports = { listTrips, findTripById, createTrip, markDispatched, markCompleted, markCancelled };
