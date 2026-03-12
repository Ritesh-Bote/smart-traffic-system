/**
 * Login.js
 *
 * The login page for police officers and admins.
 * Sends credentials to backend, receives JWT token on success.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setLoading(true);
    setError('');

    try {
      // Call login API
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;

      // Save to context and localStorage
      login(token, user);

      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard'); // Redirect to dashboard

    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">🚦</div>
          <h1 className="login-title">Traffic Portal</h1>
          <p className="login-subtitle">Smart Violation Management System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="officer@traffic.gov"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div style={{ marginTop: 24, padding: 14, background: '#f0f9ff', borderRadius: 8, fontSize: 13, color: '#075985' }}>
          <strong>Demo Credentials:</strong><br />
          Admin: admin@traffic.gov / admin123<br />
          Officer: officer@traffic.gov / officer123
        </div>

        {/* Citizen portal link */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Not a police officer?{' '}
          <Link to="/" style={{ color: '#2563a8', fontWeight: 600 }}>
            Check your violations here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
