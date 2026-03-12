/**
 * AuthContext.js
 *
 * React Context for managing authentication state globally.
 *
 * What is Context? It's React's way to share data (like the logged-in user)
 * across ALL components without passing it as props every time.
 *
 * This context provides:
 * - user: Current logged-in user object (or null)
 * - token: JWT token string (or null)
 * - login(): Function to log in
 * - logout(): Function to log out
 * - isAuthenticated: Boolean - is user logged in?
 * - loading: Boolean - is auth being checked?
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

/**
 * AuthProvider - Wraps our app and provides auth state to all children
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Checking saved auth on startup

  /**
   * On app startup, check if user was previously logged in.
   * We store the token in localStorage so it persists after refresh.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('traffic_token');
    const savedUser = localStorage.getItem('traffic_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false); // Done checking
  }, []);

  /**
   * Login function - saves token and user to state and localStorage
   */
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('traffic_token', tokenValue);
    localStorage.setItem('traffic_user', JSON.stringify(userData));
  };

  /**
   * Logout function - clears everything
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('traffic_token');
    localStorage.removeItem('traffic_user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token  // Convert token to boolean
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook - makes it easy to use auth in any component:
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
