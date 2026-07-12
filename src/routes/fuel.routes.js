const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/rbac.middleware');
const controller = require('../controllers/fuel.controller');

const router = express.Router();
const ROLES = ['fleet_manager', 'financial_analyst'];

router.use(requireAuth);

router.get('/', requireRole(...ROLES), controller.list);
router.post('/', requireRole(...ROLES), controller.create);

module.exports = router;
