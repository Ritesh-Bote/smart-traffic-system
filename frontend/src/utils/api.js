/**
 * api.js - Centralized API Configuration
 *
 * Central axios instance for the Smart Traffic Violation Management System.
 *
 * Features:
 * - Base URL set to deployed backend (Render)
 * - Automatically attaches JWT token to every request
 * - Handles 401 (unauthorized) errors globally
 */

import axios from "axios";

// Create axios instance with deployed backend URL
const api = axios.create({
  baseURL: "https://smart-traffic-backend-chb3.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Runs before EVERY API request.
 * Attaches the JWT token from localStorage to the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("traffic_token");
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
      // Token expired or invalid
      localStorage.removeItem("traffic_token");
      localStorage.removeItem("traffic_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;