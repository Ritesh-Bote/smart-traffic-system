/**
 * Authentication Middleware
 *
 * This middleware protects routes that require login.
 * It checks if the incoming request has a valid JWT token.
 *
 * How JWT works:
 * 1. User logs in → server creates a token with user info
 * 2. Frontend stores this token
 * 3. Every protected request sends this token in the header
 * 4. This middleware verifies the token before allowing access
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect Middleware - Verifies JWT token
 * Add this to any route that requires the user to be logged in
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer"
    // Format: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract the token (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, deny access
    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided. Please log in.'
      });
    }

    // Verify the token using our secret key
    // If token is invalid or expired, this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user from the token's payload (decoded.id)
    // We use .select('+password') in other places, but here we don't need password
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'Token is valid but user no longer exists'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: 'Your account has been deactivated'
      });
    }

    // Attach user info to request object
    // Now any route after this middleware can access req.user
    req.user = user;
    next(); // Continue to the actual route handler

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Admin Only Middleware
 * Use this AFTER protect middleware to restrict routes to admins only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, allow access
  } else {
    res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
};

module.exports = { protect, adminOnly };
