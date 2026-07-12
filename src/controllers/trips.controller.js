const pool = require('../config/db');
const tripModel = require('../models/trip.model');
const cityModel = require('../models/city.model');

const SERVICE_DUE_KM = 10000;
const DRIVER_REST_HOURS = 8;

async function validateForDispatch(client, { vehicleId, driverId, cargoWeightKg, source }) {
    const vehicleResult = await client.query('SELECT * FROM vehicles WHERE id = $1 FOR UPDATE', [vehicleId]);
    const vehicle = vehicleResult.rows[0];
    if (!vehicle) {
        return { error: { status: 404, message: 'Vehicle not found' } };
    }

    const driverResult = await client.query(
        `SELECT *, (license_expiry < CURRENT_DATE) AS is_expired FROM drivers WHERE id = $1 FOR UPDATE`,
        [driverId]
    );
    const driver = driverResult.rows[0];
    if (!driver) {
        return { error: { status: 404, message: 'Driver not found' } };
    }

    if (Number(cargoWeightKg) > Number(vehicle.max_load_kg)) {
        return {
            error: {
                status: 422,
                message: `Cargo ${Number(cargoWeightKg).toLocaleString()} kg exceeds capacity (${Number(
                    vehicle.max_load_kg
                ).toLocaleString()} kg)`,
            },
        };
    }
    if (vehicle.status !== 'available') {
        return { error: { status: 422, message: 'Vehicle is not available' } };
    }

    const kmSinceService = Number(vehicle.odometer_km) - Number(vehicle.last_service_odometer_km);
    if (kmSinceService > SERVICE_DUE_KM) {
        return {
            error: {
                status: 422,
                message: `Vehicle is due for service (${kmSinceService.toLocaleString()} km since last service, limit ${SERVICE_DUE_KM.toLocaleString()} km)`,
            },
        };
    }

    if (vehicle.current_location_city && source && vehicle.current_location_city.toLowerCase() !== source.toLowerCase()) {
        return {
            error: {
                status: 422,
                message: `Vehicle is currently at ${vehicle.current_location_city}, not at the trip's source (${source})`,
            },
        };
    }

    if (driver.status !== 'available') {
        return { error: { status: 422, message: 'Driver is not available' } };
    }
    if (driver.is_expired) {
        return { error: { status: 422, message: "Driver's license has expired" } };
    }

    const restResult = await client.query(
        `SELECT completed_at FROM trips WHERE driver_id = $1 AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`,
        [driverId]
    );
    const lastCompletedAt = restResult.rows[0]?.completed_at;
    if (lastCompletedAt) {
        const hoursSinceRest = (Date.now() - new Date(lastCompletedAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceRest < DRIVER_REST_HOURS) {
            return {
                error: {
                    status: 422,
                    message: `Driver must rest ${DRIVER_REST_HOURS}h after their last trip (${hoursSinceRest.toFixed(1)}h so far)`,
                },
            };
        }
    }

    return { vehicle, driver };
}

async function list(req, res) {
    const { status } = req.query;
    const trips = await tripModel.listTrips({ status });
    return res.status(200).json({ trips });
}

async function getOne(req, res) {
    const trip = await tripModel.findTripById(req.params.id);
    if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
    }
    return res.status(200).json({ trip });
}

async function create(req, res) {
    const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, action } = req.body;

    if (!source || !destination || !vehicleId || !driverId || !cargoWeightKg) {
        return res.status(422).json({ message: 'source, destination, vehicleId, driverId and cargoWeightKg are required' });
    }
    if (Number(cargoWeightKg) <= 0) {
        return res.status(422).json({ message: 'cargoWeightKg must be a positive number' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { vehicle, driver, error } = await validateForDispatch(client, {
            vehicleId,
            driverId,
            cargoWeightKg,
            source,
        });
        if (error) {
            await client.query('ROLLBACK');
            return res.status(error.status).json({ message: error.message });
        }

        const computedDistance = (await cityModel.distanceBetweenCityNames(source, destination)) ?? plannedDistanceKm ?? null;
        let trip = await tripModel.createTrip(
            { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm: computedDistance },
            client
        );

        if (action === 'dispatch') {
            trip = await tripModel.markDispatched(trip.id, vehicle.odometer_km, client);
            await client.query(`UPDATE vehicles SET status = 'on_trip', updated_at = now() WHERE id = $1`, [vehicleId]);
            await client.query(`UPDATE drivers SET status = 'on_trip', updated_at = now() WHERE id = $1`, [driverId]);
        }

        await client.query('COMMIT');
        return res.status(201).json({ trip });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function dispatch(req, res) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripResult = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [req.params.id]);
        const trip = tripResult.rows[0];
        if (!trip) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Trip not found' });
        }
        if (trip.status !== 'draft') {
            await client.query('ROLLBACK');
            return res.status(422).json({ message: 'Only draft trips can be dispatched' });
        }

        const { vehicle, error } = await validateForDispatch(client, {
            vehicleId: trip.vehicle_id,
            driverId: trip.driver_id,
            cargoWeightKg: trip.cargo_weight_kg,
            source: trip.source,
        });
        if (error) {
            await client.query('ROLLBACK');
            return res.status(error.status).json({ message: error.message });
        }

        const updated = await tripModel.markDispatched(trip.id, vehicle.odometer_km, client);
        await client.query(`UPDATE vehicles SET status = 'on_trip', updated_at = now() WHERE id = $1`, [trip.vehicle_id]);
        await client.query(`UPDATE drivers SET status = 'on_trip', updated_at = now() WHERE id = $1`, [trip.driver_id]);

        await client.query('COMMIT');
        return res.status(200).json({ trip: updated });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function complete(req, res) {
    const { endOdometerKm, fuelConsumedLiters } = req.body;
    if (endOdometerKm === undefined || endOdometerKm === null) {
        return res.status(422).json({ message: 'endOdometerKm is required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripResult = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [req.params.id]);
        const trip = tripResult.rows[0];
        if (!trip) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Trip not found' });
        }
        if (trip.status !== 'dispatched') {
            await client.query('ROLLBACK');
            return res.status(422).json({ message: 'Only dispatched trips can be completed' });
        }
        if (Number(endOdometerKm) <= Number(trip.start_odometer_km)) {
            await client.query('ROLLBACK');
            return res.status(422).json({
                message: `End odometer must be greater than the start reading (${Number(
                    trip.start_odometer_km
                ).toLocaleString()} km)`,
            });
        }

        const updated = await tripModel.markCompleted(trip.id, { endOdometerKm, fuelConsumedLiters }, client);
        const destinationCity = await cityModel.findCityByName(trip.destination);
        const newLocationCity = destinationCity ? trip.destination : null;
        await client.query(
            `UPDATE vehicles
             SET status = 'available', odometer_km = $1, updated_at = now(),
                 current_location_city = COALESCE($2, current_location_city)
             WHERE id = $3`,
            [endOdometerKm, newLocationCity, trip.vehicle_id]
        );
        await client.query(`UPDATE drivers SET status = 'available', updated_at = now() WHERE id = $1`, [trip.driver_id]);

        await client.query('COMMIT');
        return res.status(200).json({ trip: updated });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function cancel(req, res) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripResult = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [req.params.id]);
        const trip = tripResult.rows[0];
        if (!trip) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Trip not found' });
        }
        if (!['draft', 'dispatched'].includes(trip.status)) {
            await client.query('ROLLBACK');
            return res.status(422).json({ message: 'Only draft or dispatched trips can be cancelled' });
        }

        const updated = await tripModel.markCancelled(trip.id, client);

        if (trip.status === 'dispatched') {
            await client.query(`UPDATE vehicles SET status = 'available', updated_at = now() WHERE id = $1`, [trip.vehicle_id]);
            await client.query(`UPDATE drivers SET status = 'available', updated_at = now() WHERE id = $1`, [trip.driver_id]);
        }

        await client.query('COMMIT');
        return res.status(200).json({ trip: updated });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { list, getOne, create, dispatch, complete, cancel };
