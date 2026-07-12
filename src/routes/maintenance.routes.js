const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/rbac.middleware');
const controller = require('../controllers/maintenance.controller');

const router = express.Router();
const ROLES = ['fleet_manager'];

router.use(requireAuth);

router.get('/', requireRole(...ROLES), controller.list);
router.post('/', requireRole(...ROLES), controller.create);
router.post('/:id/close', requireRole(...ROLES), controller.close);

module.exports = router;
