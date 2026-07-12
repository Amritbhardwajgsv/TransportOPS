const pool = require('../config/db');

const SELECT_COLUMNS = 'id, vehicle_id, doc_type, file_name, mime_type, file_size, uploaded_at';

async function listByVehicle(vehicleId) {
    const result = await pool.query(
        `SELECT ${SELECT_COLUMNS} FROM vehicle_documents WHERE vehicle_id = $1 ORDER BY uploaded_at DESC`,
        [vehicleId]
    );
    return result.rows;
}

async function findById(id) {
    const result = await pool.query('SELECT * FROM vehicle_documents WHERE id = $1', [id]);
    return result.rows[0];
}

async function createDocument({ vehicleId, docType, fileName, mimeType, fileSize, fileData }) {
    const result = await pool.query(
        `INSERT INTO vehicle_documents (vehicle_id, doc_type, file_name, mime_type, file_size, file_data)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${SELECT_COLUMNS}`,
        [vehicleId, docType, fileName, mimeType, fileSize, fileData]
    );
    return result.rows[0];
}

async function deleteDocument(id) {
    const result = await pool.query('DELETE FROM vehicle_documents WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
}

module.exports = { listByVehicle, findById, createDocument, deleteDocument };
