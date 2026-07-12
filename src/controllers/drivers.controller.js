const driverModel = require('../models/driver.model');

const MAX_PHOTO_LENGTH = 280000;

function validateDriverPayload(body) {
    const { name, licenseNumber, licenseExpiry, safetyScore, photo } = body;

    if (!name || !licenseNumber || !licenseExpiry) {
        return 'name, licenseNumber and licenseExpiry are required';
    }
    if (Number.isNaN(Date.parse(licenseExpiry))) {
        return 'licenseExpiry must be a valid date';
    }
    if (safetyScore !== undefined && (safetyScore < 0 || safetyScore > 100)) {
        return 'safetyScore must be between 0 and 100';
    }
    if (photo && photo.length > MAX_PHOTO_LENGTH) {
        return 'photo is too large (max ~200KB)';
    }
    return null;
}

async function list(req, res) {
    const { search, status, availableForDispatch } = req.query;
    const drivers = await driverModel.listDrivers({
        search,
        status: availableForDispatch === 'true' ? 'available' : status,
        excludeExpired: availableForDispatch === 'true',
    });
    return res.status(200).json({ drivers });
}

async function getOne(req, res) {
    const driver = await driverModel.findDriverById(req.params.id);
    if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
    }
    return res.status(200).json({ driver });
}

async function create(req, res) {
    try {
        const error = validateDriverPayload(req.body);
        if (error) {
            return res.status(422).json({ message: error });
        }

        const { name, licenseNumber, licenseExpiry, safetyScore, photo } = req.body;
        const driver = await driverModel.createDriver({ name, licenseNumber, licenseExpiry, safetyScore, photo });
        return res.status(201).json({ driver });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A driver with this license number already exists' });
        }
        throw err;
    }
}

async function update(req, res) {
    try {
        const existing = await driverModel.findDriverById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        const error = validateDriverPayload(req.body);
        if (error) {
            return res.status(422).json({ message: error });
        }

        const { name, licenseNumber, licenseExpiry, safetyScore, photo } = req.body;
        const driver = await driverModel.updateDriver(req.params.id, {
            name,
            licenseNumber,
            licenseExpiry,
            safetyScore: safetyScore ?? existing.safety_score,
            photo,
        });
        return res.status(200).json({ driver });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A driver with this license number already exists' });
        }
        throw err;
    }
}

async function suspend(req, res) {
    const existing = await driverModel.findDriverById(req.params.id);
    if (!existing) {
        return res.status(404).json({ message: 'Driver not found' });
    }
    if (existing.status === 'on_trip') {
        return res.status(422).json({ message: 'Cannot suspend a driver who is currently on a trip' });
    }
    const driver = await driverModel.setDriverStatus(req.params.id, 'suspended');
    return res.status(200).json({ driver });
}

async function reinstate(req, res) {
    const existing = await driverModel.findDriverById(req.params.id);
    if (!existing) {
        return res.status(404).json({ message: 'Driver not found' });
    }
    const driver = await driverModel.setDriverStatus(req.params.id, 'available');
    return res.status(200).json({ driver });
}

module.exports = { list, getOne, create, update, suspend, reinstate };
