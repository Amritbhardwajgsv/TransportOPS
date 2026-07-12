const roleModel = require('../models/role.model');

async function list(req, res) {
    const roles = await roleModel.listRoles();
    return res.status(200).json({ roles });
}

module.exports = { list };
