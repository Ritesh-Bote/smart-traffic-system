// statsRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/stats/dashboard - Dashboard statistics (protected)
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
