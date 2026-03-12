/**
 * CitizenPortal.js
 *
 * The PUBLIC page where citizens can check their vehicle violations.
 * No login required - anyone can access this.
 *
 * Features:
 * - Enter vehicle number to search
 * - View all violations for that vehicle
 * - See total fine amount due
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiAlertCircle, FiCheckCircle, FiClock, FiMapPin, FiCalendar } from 'react-icons/fi';
import { MdOutlineDirectionsCar } from 'react-icons/md';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
  const styles = {
    'Pending': { background: '#fffbeb', color: '#92400e' },
    'Paid': { background: '#f0fdf4', color: '#14532d' },
    'Disputed': { background: '#fdf4ff', color: '#7e22ce' },
    'Cancelled': { background: '#f1f5f9', color: '#475569' }
  };
  const s = styles[status] || styles['Pending'];
  return (
    <span style={{ ...s, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
};

const CitizenPortal = () => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle number');
      return;
    }
    if (vehicleNumber.trim().length < 4) {
      setError('Please enter a valid vehicle number (min 4 characters)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.get(`${API_BASE}/citizen/check/${vehicleNumber.trim()}`);
      setResult(response.data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVehicleNumber('');
    setResult(null);
    setError('');
    setSearched(false);
  };

  return (
    <div className="citizen-portal">
      {/* Admin login link */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 8, backdropFilter: 'blur(10px)' }}>
          Police Login →
        </Link>
      </div>

      <div className="citizen-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🚦</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: '#1a3a5c', lineHeight: 1 }}>
            Traffic Violation Check
          </h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
            Enter your vehicle number to check pending violations and fines
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <MdOutlineDirectionsCar style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 22 }} />
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => { setVehicleNumber(e.target.value.toUpperCase()); setError(''); }}
              className="form-control"
              style={{ paddingLeft: 44, paddingRight: 44, height: 52, fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderColor: error ? '#dc2626' : '#e2e8f0', borderWidth: 2 }}
              placeholder="e.g., MH12AB1234"
              maxLength={20}
            />
            {vehicleNumber && (
              <button type="button" onClick={handleReset} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>
                ×
              </button>
            )}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontSize: 13, marginBottom: 10 }}>
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', height: 48 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></div>
                Searching...
              </>
            ) : (
              <><FiSearch /> Check Violations</>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div style={{ marginTop: 28 }}>
            {/* Summary */}
            <div style={{
              background: result.found ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${result.found ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{ fontSize: 32 }}>{result.found ? '⚠️' : '✅'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: result.found ? '#991b1b' : '#14532d' }}>
                  {result.found
                    ? `${result.summary.totalViolations} Violation${result.summary.totalViolations > 1 ? 's' : ''} Found`
                    : 'No Violations Found'
                  }
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                  Vehicle: <strong style={{ fontFamily: 'monospace' }}>{result.vehicleNumber}</strong>
                </div>
              </div>
              {result.found && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: '#dc2626' }}>
                    ₹{result.summary.pendingFineAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Pending Fine</div>
                </div>
              )}
            </div>

            {/* Fine breakdown */}
            {result.found && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Total Fines', value: `₹${result.summary.totalFineAmount.toLocaleString('en-IN')}`, color: '#1a3a5c' },
                  { label: 'Pending', value: `₹${result.summary.pendingFineAmount.toLocaleString('en-IN')}`, color: '#dc2626' },
                  { label: 'Total Cases', value: result.summary.totalViolations, color: '#2563a8' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Violations list */}
            {result.violations.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, color: '#334155', marginBottom: 12 }}>
                  Violation Records
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                  {result.violations.map((v, i) => (
                    <div key={v._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: '#1a3a5c' }}>
                            {v.violationType}
                          </span>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Case #{i + 1}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>
                            ₹{v.fineAmount.toLocaleString('en-IN')}
                          </div>
                          <StatusBadge status={v.status} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                          <FiCalendar size={12} />
                          {new Date(v.date).toLocaleDateString('en-IN')} at {v.time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                          <FiMapPin size={12} />
                          {v.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
          For queries, contact your nearest traffic police station
        </div>
      </div>
    </div>
  );
};

export default CitizenPortal;
