/**
 * api.js - Centralized API Configuration
 *
 * Instead of writing fetch/axios calls everywhere, we create
 * a pre-configured axios instance here and import it in other files.
 *
 * Features:
 * - Base URL set to backend
 * - Automatically adds JWT token to every request
 * - Handles 401 (unauthorized) errors globally
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor
 * Runs before EVERY API request.
 * Attaches the JWT token from localStorage to the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('traffic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Runs after every API response.
 * If we get a 401 (unauthorized), redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('traffic_token');
      localStorage.removeItem('traffic_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
