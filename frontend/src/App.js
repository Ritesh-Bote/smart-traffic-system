/**
 * App.js - Main Application Component
 *
 * This is the root of our React application.
 * It sets up all the routes (pages) using React Router v6.
 *
 * Routes:
 * / → Citizen portal (public)
 * /login → Login page (public)
 * /dashboard → Overview stats (protected)
 * /violations → View all violations (protected)
 * /violations/add → Add new violation (protected)
 * /violations/edit/:id → Edit violation (protected)
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Provider
import { AuthProvider } from './context/AuthContext';

// Page Components
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ViolationList from './components/Violations/ViolationList';
import AddViolation from './components/Violations/AddViolation';
import EditViolation from './components/Violations/EditViolation';
import CitizenPortal from './components/Citizen/CitizenPortal';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Global styles
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes - No login required */}
            <Route path="/" element={<CitizenPortal />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes - Login required */}
            {/* These routes are wrapped in Layout (shows navbar + sidebar) */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/violations" element={<ViolationList />} />
              <Route path="/violations/add" element={<AddViolation />} />
              <Route path="/violations/edit/:id" element={<EditViolation />} />
            </Route>

            {/* Catch all - redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast notification container */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
