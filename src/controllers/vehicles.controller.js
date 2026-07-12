const vehicleModel = require('../models/vehicle.model');
const cityModel = require('../models/city.model');

const VEHICLE_TYPES = ['truck', 'van', 'trailer', 'pickup'];
const MAX_PHOTO_LENGTH = 280000;

async function validateVehiclePayload(body) {
    const { registrationNumber, model, type, maxLoadKg, photo, currentLocationCity } = body;

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
    if (currentLocationCity) {
        const city = await cityModel.findCityByName(currentLocationCity);
        if (!city) {
            return `currentLocationCity must be a known city`;
        }
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
        const error = await validateVehiclePayload(req.body);
        if (error) {
            return res.status(422).json({ message: error });
        }

        const { registrationNumber, model, type, maxLoadKg, odometerKm, acquisitionCost, photo, currentLocationCity } =
            req.body;
        const vehicle = await vehicleModel.createVehicle({
            registrationNumber,
            model,
            type,
            maxLoadKg,
            odometerKm,
            acquisitionCost,
            photo,
            currentLocationCity,
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

        const error = await validateVehiclePayload(req.body);
        if (error) {
            return res.status(422).json({ message: error });
        }

        const { registrationNumber, model, type, maxLoadKg, odometerKm, acquisitionCost, photo, currentLocationCity } =
            req.body;
        const vehicle = await vehicleModel.updateVehicle(req.params.id, {
            registrationNumber,
            model,
            type,
            maxLoadKg,
            odometerKm: odometerKm ?? existing.odometer_km,
            acquisitionCost,
            photo,
            currentLocationCity,
        });
        return res.status(200).json({ vehicle });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A vehicle with this registration number already exists' });
        }
        throw err;
    }
}

async function retire(req, res) {
    const existing = await vehicleModel.findVehicleById(req.params.id);
    if (!existing) {
        return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (existing.status === 'on_trip') {
        return res.status(422).json({ message: 'Cannot retire a vehicle that is currently on a trip' });
    }
    if (existing.status === 'retired') {
        return res.status(422).json({ message: 'Vehicle is already retired' });
    }
    const vehicle = await vehicleModel.setVehicleStatus(req.params.id, 'retired');
    return res.status(200).json({ vehicle });
}

async function reinstate(req, res) {
    const existing = await vehicleModel.findVehicleById(req.params.id);
    if (!existing) {
        return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (existing.status !== 'retired') {
        return res.status(422).json({ message: 'Vehicle is not retired' });
    }
    const vehicle = await vehicleModel.setVehicleStatus(req.params.id, 'available');
    return res.status(200).json({ vehicle });
}

module.exports = { list, getOne, create, update, retire, reinstate, VEHICLE_TYPES };
