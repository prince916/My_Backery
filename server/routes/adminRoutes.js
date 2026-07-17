const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', ctrl.getDashboardStats);

module.exports = router;
