const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/rbac.middleware');
const controller = require('../controllers/cities.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/', controller.list);
router.post('/', requireRole('fleet_manager'), controller.create);

module.exports = router;
