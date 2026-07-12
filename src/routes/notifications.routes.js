const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/rbac.middleware');
const controller = require('../controllers/notifications.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/license-reminders/run', requireRole('fleet_manager', 'safety_officer'), controller.runLicenseReminders);

module.exports = router;
