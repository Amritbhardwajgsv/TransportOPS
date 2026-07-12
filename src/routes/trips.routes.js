const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/rbac.middleware');
const controller = require('../controllers/trips.controller');

const router = express.Router();
const READ_ROLES = ['fleet_manager', 'driver', 'safety_officer'];
const WRITE_ROLES = ['fleet_manager', 'driver'];

router.use(requireAuth);

router.get('/', requireRole(...READ_ROLES), controller.list);
router.get('/:id', requireRole(...READ_ROLES), controller.getOne);
router.post('/', requireRole(...WRITE_ROLES), controller.create);
router.post('/:id/dispatch', requireRole(...WRITE_ROLES), controller.dispatch);
router.post('/:id/complete', requireRole(...WRITE_ROLES), controller.complete);
router.post('/:id/cancel', requireRole(...WRITE_ROLES), controller.cancel);

module.exports = router;
