const cityModel = require('../models/city.model');

async function list(req, res) {
    const cities = await cityModel.listCities();
    return res.status(200).json({ cities });
}

async function create(req, res) {
    try {
        const { name, lat, lng } = req.body;

        if (!name || lat === undefined || lat === null || lng === undefined || lng === null) {
            return res.status(422).json({ message: 'name, lat and lng are required' });
        }
        if (Number(lat) < -90 || Number(lat) > 90) {
            return res.status(422).json({ message: 'lat must be between -90 and 90' });
        }
        if (Number(lng) < -180 || Number(lng) > 180) {
            return res.status(422).json({ message: 'lng must be between -180 and 180' });
        }

        const city = await cityModel.createCity({ name: name.trim(), lat, lng });
        return res.status(201).json({ city });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A city with this name already exists' });
        }
        throw err;
    }
}

module.exports = { list, create };
