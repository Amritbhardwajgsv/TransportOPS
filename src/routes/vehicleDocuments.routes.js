const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/rbac.middleware');
const controller = require('../controllers/vehicleDocuments.controller');

const router = express.Router();
const READ_ROLES = ['fleet_manager', 'driver', 'financial_analyst'];
const WRITE_ROLES = ['fleet_manager'];

router.use(requireAuth);

router.get('/', requireRole(...READ_ROLES), controller.list);
router.get('/:id/file', requireRole(...READ_ROLES), controller.getFile);
router.post('/', requireRole(...WRITE_ROLES), controller.create);
router.delete('/:id', requireRole(...WRITE_ROLES), controller.remove);

module.exports = router;
