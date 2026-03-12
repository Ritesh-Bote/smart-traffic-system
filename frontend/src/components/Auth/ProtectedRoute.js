/**
 * ProtectedRoute.js
 *
 * A wrapper component that checks if user is authenticated.
 * If not logged in, redirects to login page.
 *
 * Usage: Wrap any route that requires authentication.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait while checking saved auth from localStorage
  if (loading) {
    return (
      <div className="loading-spinner" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Not logged in? Redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in? Render the protected content
  return children;
};

export default ProtectedRoute;
