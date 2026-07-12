const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/rbac.middleware');
const controller = require('../controllers/drivers.controller');

const router = express.Router();
const READ_ROLES = ['fleet_manager', 'driver', 'safety_officer'];
const WRITE_ROLES = ['fleet_manager'];
const COMPLIANCE_ROLES = ['fleet_manager', 'safety_officer'];

router.use(requireAuth);

router.get('/', requireRole(...READ_ROLES), controller.list);
router.get('/:id', requireRole(...READ_ROLES), controller.getOne);
router.post('/', requireRole(...WRITE_ROLES), controller.create);
router.put('/:id', requireRole(...COMPLIANCE_ROLES), controller.update);
router.post('/:id/suspend', requireRole(...COMPLIANCE_ROLES), controller.suspend);
router.post('/:id/reinstate', requireRole(...COMPLIANCE_ROLES), controller.reinstate);

module.exports = router;
