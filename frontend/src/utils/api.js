/**
 * api.js - Centralized API Configuration
 *
 * Central axios instance for the Smart Traffic Violation Management System.
 *
 * Features:
 * - Automatically selects correct backend URL
 * - Adds JWT token to every request
 * - Handles authentication errors globally
 */

import axios from "axios";

// Detect environment
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://smart-traffic-backend-chb3.onrender.com/api"
    : "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Adds JWT token (if available)
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
 * Handles authentication errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
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