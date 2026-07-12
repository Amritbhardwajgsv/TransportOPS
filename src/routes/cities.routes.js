const express = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const controller = require('../controllers/cities.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/', controller.list);

module.exports = router;
