// citizenRoutes.js - Public routes for citizens
const express = require('express');
const router = express.Router();
const { checkViolations } = require('../controllers/citizenController');

// GET /api/citizen/check/:vehicleNumber - Public lookup (no auth needed)
router.get('/check/:vehicleNumber', checkViolations);

module.exports = router;
