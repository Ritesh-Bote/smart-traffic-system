/**
 * Violation Routes
 * Base URL: /api/violations
 * All routes require authentication (protect middleware)
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createViolation, getAllViolations, getViolationById,
  updateViolation, deleteViolation, searchByVehicle
} = require('../controllers/violationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Validation rules for creating/updating violations
const violationValidation = [
  body('vehicleNumber')
    .trim()
    .notEmpty().withMessage('Vehicle number is required')
    .isLength({ min: 4, max: 20 }).withMessage('Vehicle number must be 4-20 characters'),
  body('violationType')
    .notEmpty().withMessage('Violation type is required'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Please enter a valid date'),
  body('time')
    .notEmpty().withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 3, max: 200 }).withMessage('Location must be 3-200 characters'),
  body('fineAmount')
    .notEmpty().withMessage('Fine amount is required')
    .isNumeric().withMessage('Fine amount must be a number')
    .isFloat({ min: 0 }).withMessage('Fine amount cannot be negative')
];

// Apply protect middleware to ALL routes in this file
router.use(protect);

// GET /api/violations - Get all violations (with optional filters)
router.get('/', getAllViolations);

// GET /api/violations/search/:vehicleNumber - Search by vehicle
router.get('/search/:vehicleNumber', searchByVehicle);

// GET /api/violations/:id - Get single violation
router.get('/:id', getViolationById);

// POST /api/violations - Create new violation
router.post('/', violationValidation, createViolation);

// PUT /api/violations/:id - Update violation
router.put('/:id', updateViolation);

// DELETE /api/violations/:id - Delete violation (admin only)
router.delete('/:id', adminOnly, deleteViolation);

module.exports = router;
