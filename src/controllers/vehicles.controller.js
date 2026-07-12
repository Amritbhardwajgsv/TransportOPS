const vehicleModel = require('../models/vehicle.model');

const VEHICLE_TYPES = ['truck', 'van', 'trailer', 'pickup'];
const MAX_PHOTO_LENGTH = 280000;

function validateVehiclePayload(body) {
    const { registrationNumber, model, type, maxLoadKg, photo } = body;

    if (!registrationNumber || !model || !type) {
        return 'registrationNumber, model and type are required';
    }
    if (!VEHICLE_TYPES.includes(type)) {
        return `type must be one of: ${VEHICLE_TYPES.join(', ')}`;
    }
    if (maxLoadKg === undefined || maxLoadKg === null || Number(maxLoadKg) <= 0) {
        return 'maxLoadKg must be a positive number';
    }
    if (photo && photo.length > MAX_PHOTO_LENGTH) {
        return 'photo is too large (max ~200KB)';
    }
    return null;
}

async function list(req, res) {
    const { search, status } = req.query;
    const vehicles = await vehicleModel.listVehicles({ search, status });
    return res.status(200).json({ vehicles });
}

async function getOne(req, res) {
    const vehicle = await vehicleModel.findVehicleById(req.params.id);
    if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
    }
    return res.status(200).json({ vehicle });
}

async function create(req, res) {
    try {
        const error = validateVehiclePayload(req.body);
        if (error) {
            return res.status(422).json({ message: error });
        }

        const { registrationNumber, model, type, maxLoadKg, odometerKm, acquisitionCost, photo } = req.body;
        const vehicle = await vehicleModel.createVehicle({
            registrationNumber,
            model,
            type,
            maxLoadKg,
            odometerKm,
            acquisitionCost,
            photo,
        });
        return res.status(201).json({ vehicle });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A vehicle with this registration number already exists' });
        }
        throw err;
    }
}

async function update(req, res) {
    try {
        const existing = await vehicleModel.findVehicleById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const error = validateVehiclePayload(req.body);
        if (error) {
            return res.status(422).json({ message: error });
        }

        const { registrationNumber, model, type, maxLoadKg, odometerKm, acquisitionCost, photo } = req.body;
        const vehicle = await vehicleModel.updateVehicle(req.params.id, {
            registrationNumber,
            model,
            type,
            maxLoadKg,
            odometerKm: odometerKm ?? existing.odometer_km,
            acquisitionCost,
            photo,
        });
        return res.status(200).json({ vehicle });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A vehicle with this registration number already exists' });
        }
        throw err;
    }
}

module.exports = { list, getOne, create, update, VEHICLE_TYPES };
