const cityModel = require('../models/city.model');

async function list(req, res) {
    const cities = await cityModel.listCities();
    return res.status(200).json({ cities });
}

module.exports = { list };
