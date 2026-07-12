const fuelModel = require('../models/fuel.model');

async function list(req, res) {
    const { vehicleId, limit } = req.query;
    const logs = await fuelModel.listFuelLogs({ vehicleId, limit });
    return res.status(200).json({ logs });
}

async function create(req, res) {
    const { vehicleId, liters, cost, odometerKm } = req.body;
    if (!vehicleId || !liters || cost === undefined) {
        return res.status(422).json({ message: 'vehicleId, liters and cost are required' });
    }
    if (Number(liters) <= 0 || Number(cost) < 0) {
        return res.status(422).json({ message: 'liters must be positive and cost cannot be negative' });
    }
    const log = await fuelModel.createFuelLog({ vehicleId, liters, cost, odometerKm });
    return res.status(201).json({ log });
}

module.exports = { list, create };
