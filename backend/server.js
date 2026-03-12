/**
 * Smart Traffic Violation Management System
 * Main Server Entry Point
 *
 * This file starts our Express server, connects to MongoDB,
 * and sets up all the routes (API endpoints).
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import our route files
const authRoutes = require('./routes/authRoutes');
const violationRoutes = require('./routes/violationRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Create Express application
const app = express();

// ==================== MIDDLEWARE SETUP ====================

// Enable CORS - allows our React frontend (on port 3000) to talk to this backend (on port 5000)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse incoming JSON requests (lets us read req.body)
app.use(express.json());

// Parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES SETUP ====================

// All routes are prefixed with /api
app.use('/api/auth', authRoutes);         // Login, register endpoints
app.use('/api/violations', violationRoutes); // CRUD for violations
app.use('/api/citizen', citizenRoutes);   // Public citizen lookup
app.use('/api/stats', statsRoutes);       // Dashboard statistics

// Root endpoint - just to confirm server is running
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Traffic Violation Management System API',
    status: 'Running',
    version: '1.0.0'
  });
});

// ==================== ERROR HANDLING ====================

// Handle routes that don't exist
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler - catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ==================== DATABASE CONNECTION & START SERVER ====================

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_traffic_db';

// Connect to MongoDB, then start the server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit if we can't connect to database
  });
