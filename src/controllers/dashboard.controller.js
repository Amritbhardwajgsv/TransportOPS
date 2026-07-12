const dashboardModel = require('../models/dashboard.model');

async function summary(req, res) {
    const data = await dashboardModel.getSummary();
    return res.status(200).json(data);
}

module.exports = { summary };
