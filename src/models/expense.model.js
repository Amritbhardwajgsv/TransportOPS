const pool = require('../config/db');

const SELECT_COLUMNS = `
    e.id, e.category, e.description, e.cost, e.logged_at, e.created_at,
    e.vehicle_id, v.registration_number AS vehicle_registration
`;
const BASE_JOIN = `FROM expenses e LEFT JOIN vehicles v ON v.id = e.vehicle_id`;

async function listExpenses({ vehicleId, category, limit }) {
    const conditions = [];
    const params = [];
    if (vehicleId) {
        params.push(vehicleId);
        conditions.push(`e.vehicle_id = $${params.length}`);
    }
    if (category) {
        params.push(category);
        conditions.push(`e.category = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = limit ? `LIMIT ${Number(limit)}` : '';
    const result = await pool.query(
        `SELECT ${SELECT_COLUMNS} ${BASE_JOIN} ${where} ORDER BY e.logged_at DESC ${limitClause}`,
        params
    );
    return result.rows;
}

async function createExpense({ vehicleId, category, description, cost }) {
    const result = await pool.query(
        `INSERT INTO expenses (vehicle_id, category, description, cost) VALUES ($1, $2, $3, $4) RETURNING id`,
        [vehicleId ?? null, category, description ?? null, cost]
    );
    const created = await pool.query(`SELECT ${SELECT_COLUMNS} ${BASE_JOIN} WHERE e.id = $1`, [result.rows[0].id]);
    return created.rows[0];
}

module.exports = { listExpenses, createExpense };
