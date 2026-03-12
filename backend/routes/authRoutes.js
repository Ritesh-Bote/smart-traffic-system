/**
 * Authentication Routes
 * Base URL: /api/auth
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile, getAllUsers } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Validation rules for registration
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'police']).withMessage('Role must be admin or police')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Route definitions
// POST /api/auth/register - Create new account
router.post('/register', registerValidation, register);

// POST /api/auth/login - Login
router.post('/login', loginValidation, login);

// GET /api/auth/profile - Get my profile (requires login)
router.get('/profile', protect, getProfile);

// GET /api/auth/users - Get all users (admin only)
router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;
