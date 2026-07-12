const pool = require('../config/db');

async function listRoles() {
    const result = await pool.query('SELECT id, name, description FROM roles ORDER BY name');
    return result.rows;
}

async function findRoleByName(name) {
    if (!name) return undefined;
    const result = await pool.query('SELECT id, name, description FROM roles WHERE name = $1', [name]);
    return result.rows[0];
}

module.exports = { listRoles, findRoleByName };
