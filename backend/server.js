/**
 * Smart Traffic Violation Management System
 * Main Server Entry Point
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const violationRoutes = require('./routes/violationRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Initialize app
const app = express();

// ==================== DATABASE CONNECTION ====================
connectDB();

// ==================== CORS CONFIGURATION ====================

// Allow both local development and Vercel frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://smart-traffic-system-lime.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "CORS policy: This origin is not allowed.";
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },
  credentials: true
}));

// ==================== MIDDLEWARE ====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

app.use('/api/auth', authRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Traffic Violation Management System API',
    status: 'Running'
  });
});

// ==================== ERROR HANDLING ====================

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal Server Error'
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at /api`);
});