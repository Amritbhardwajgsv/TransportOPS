const pool = require('../config/db');

const SELECT_COLUMNS = `
    m.id, m.description, m.cost, m.status, m.opened_at, m.closed_at, m.created_at, m.updated_at,
    m.vehicle_id, v.registration_number AS vehicle_registration, v.model AS vehicle_model
`;
const BASE_JOIN = `FROM maintenance_records m JOIN vehicles v ON v.id = m.vehicle_id`;

async function listRecords({ status }) {
    const conditions = [];
    const params = [];
    if (status) {
        params.push(status);
        conditions.push(`m.status = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT ${SELECT_COLUMNS} ${BASE_JOIN} ${where} ORDER BY m.opened_at DESC`, params);
    return result.rows;
}

async function findRecordById(id, client = pool) {
    const result = await client.query(`SELECT ${SELECT_COLUMNS} ${BASE_JOIN} WHERE m.id = $1`, [id]);
    return result.rows[0];
}

async function createRecord({ vehicleId, description, cost }, client = pool) {
    const result = await client.query(
        `INSERT INTO maintenance_records (vehicle_id, description, cost) VALUES ($1, $2, $3) RETURNING id`,
        [vehicleId, description, cost ?? null]
    );
    return findRecordById(result.rows[0].id, client);
}

async function closeRecord(id, client = pool) {
    await client.query(
        `UPDATE maintenance_records SET status = 'closed', closed_at = now(), updated_at = now() WHERE id = $1`,
        [id]
    );
    return findRecordById(id, client);
}

module.exports = { listRecords, findRecordById, createRecord, closeRecord };
