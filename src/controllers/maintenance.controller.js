const pool = require('../config/db');
const maintenanceModel = require('../models/maintenance.model');

async function list(req, res) {
    const { status } = req.query;
    const records = await maintenanceModel.listRecords({ status });
    return res.status(200).json({ records });
}

async function create(req, res) {
    const { vehicleId, description, cost } = req.body;
    if (!vehicleId || !description) {
        return res.status(422).json({ message: 'vehicleId and description are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const vehicleResult = await client.query('SELECT * FROM vehicles WHERE id = $1 FOR UPDATE', [vehicleId]);
        const vehicle = vehicleResult.rows[0];
        if (!vehicle) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (vehicle.status === 'retired') {
            await client.query('ROLLBACK');
            return res.status(422).json({ message: 'Cannot open a maintenance record for a retired vehicle' });
        }
        if (vehicle.status === 'on_trip') {
            await client.query('ROLLBACK');
            return res.status(422).json({ message: 'Cannot open a maintenance record while the vehicle is on a trip' });
        }

        const record = await maintenanceModel.createRecord({ vehicleId, description, cost }, client);
        await client.query(`UPDATE vehicles SET status = 'in_shop', updated_at = now() WHERE id = $1`, [vehicleId]);

        await client.query('COMMIT');
        return res.status(201).json({ record });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function close(req, res) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const recordResult = await client.query('SELECT * FROM maintenance_records WHERE id = $1 FOR UPDATE', [
            req.params.id,
        ]);
        const record = recordResult.rows[0];
        if (!record) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        if (record.status !== 'open') {
            await client.query('ROLLBACK');
            return res.status(422).json({ message: 'Only open maintenance records can be closed' });
        }

        const updated = await maintenanceModel.closeRecord(record.id, client);
        await client.query(
            `UPDATE vehicles
             SET status = CASE WHEN status = 'retired' THEN status ELSE 'available' END,
                 last_service_odometer_km = odometer_km, updated_at = now()
             WHERE id = $1`,
            [record.vehicle_id]
        );

        await client.query('COMMIT');
        return res.status(200).json({ record: updated });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { list, create, close };
