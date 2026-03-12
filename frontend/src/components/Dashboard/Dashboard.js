/**
 * Dashboard.js
 *
 * The main dashboard showing:
 * - Summary statistics (total violations, pending, paid, etc.)
 * - Recent violations table
 * - Top violation types
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiDollarSign, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { MdOutlineDirectionsCar } from 'react-icons/md';
import api from '../../utils/api';

// Format currency in Indian Rupees
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const StatusBadge = ({ status }) => {
  const classMap = {
    'Pending': 'badge badge-pending',
    'Paid': 'badge badge-paid',
    'Disputed': 'badge badge-disputed',
    'Cancelled': 'badge badge-cancelled'
  };
  return <span className={classMap[status] || 'badge'}>{status}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/dashboard');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  const { overview, topViolationTypes, recentViolations, monthlyTrend } = stats;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('/violations/add')}>
          <FiPlus /> Record Violation
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiAlertTriangle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{overview.totalViolations}</div>
            <div className="stat-label">Total Violations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <FiClock />
          </div>
          <div className="stat-info">
            <div className="stat-value">{overview.pendingViolations}</div>
            <div className="stat-label">Pending Payment</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{overview.paidViolations}</div>
            <div className="stat-label">Fines Paid</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>
              {formatCurrency(overview.totalFineCollected)}
            </div>
            <div className="stat-label">Revenue Collected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <MdOutlineDirectionsCar />
          </div>
          <div className="stat-info">
            <div className="stat-value">{overview.todayViolations}</div>
            <div className="stat-label">Recorded Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <FiAlertTriangle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{overview.disputedViolations}</div>
            <div className="stat-label">Disputed Cases</div>
          </div>
        </div>
      </div>

      {/* Two-column grid: Recent Violations + Top Types */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* Recent Violations */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Violations</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/violations')}>
              View All
            </button>
          </div>
          <div className="table-wrapper">
            {recentViolations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No violations yet</h3>
                <p>Start recording violations</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Vehicle No.</th>
                    <th>Violation</th>
                    <th>Fine (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentViolations.map((v) => (
                    <tr key={v._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/violations')}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a3a5c' }}>
                          {v.vehicleNumber}
                        </span>
                      </td>
                      <td>{v.violationType}</td>
                      <td style={{ fontWeight: 600 }}>₹{v.fineAmount.toLocaleString('en-IN')}</td>
                      <td><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Violation Types */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Violations</h2>
          </div>
          <div className="card-body">
            {topViolationTypes.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 14 }}>No data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topViolationTypes.map((item, index) => {
                  const maxCount = topViolationTypes[0]?.count || 1;
                  const percentage = Math.round((item.count / maxCount) * 100);
                  const colors = ['#2563a8', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

                  return (
                    <div key={item._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{item._id}</span>
                        <span style={{ fontWeight: 700, color: colors[index] }}>{item.count}</span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: colors[index], borderRadius: 100, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyTrend.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h2 className="card-title">
              <FiTrendingUp style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Monthly Trend (Last 6 Months)
            </h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 120 }}>
              {monthlyTrend.map((item, i) => {
                const maxCount = Math.max(...monthlyTrend.map(m => m.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{item.count}</span>
                    <div
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        minHeight: 4,
                        background: 'linear-gradient(180deg, #2563a8, #1a3a5c)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.8s ease'
                      }}
                    />
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
