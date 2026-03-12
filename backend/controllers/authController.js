/**
 * Authentication Controller
 *
 * Contains the logic for:
 * - register: Create a new admin/police account
 * - login: Authenticate and get JWT token
 * - getProfile: Get current user's info
 */

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generate JWT Token
 * Creates a token that expires in 7 days containing the user's ID
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                    // Payload: what we store in the token
    process.env.JWT_SECRET,            // Secret key to sign the token
    { expiresIn: '7d' }               // Token expires in 7 days
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new police officer or admin
 * @access  Public (or Admin only in production)
 */
const register = async (req, res) => {
  try {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, badgeNumber } = req.body;

    // Check if email already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user (password will be hashed automatically by the pre-save hook in User model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'police',
      badgeNumber
    });

    // Generate JWT token for the new user
    const token = generateToken(user._id);

    // Send response (don't send password back!)
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email, include password for comparison
    // We use .select('+password') because password has select: false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Don't tell user whether email or password was wrong (security best practice)
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated' });
    }

    // Compare provided password with hashed password in database
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Password is correct! Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get current logged-in user's profile
 * @access  Protected (requires valid JWT token)
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Admin only
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getProfile, getAllUsers };
