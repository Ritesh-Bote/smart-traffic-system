/**
 * ViolationList.js
 *
 * Displays all violations in a paginated table.
 * Features:
 * - Search by vehicle number
 * - Filter by status and type
 * - Pagination
 * - Edit and delete actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFilter, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const VIOLATION_TYPES = [
  'Signal Jump', 'Over Speeding', 'Wrong Parking', 'No Helmet',
  'No Seat Belt', 'Drunk Driving', 'Wrong Side Driving',
  'Using Mobile While Driving', 'Overloading', 'No License', 'No Insurance',
  'Triple Riding', 'Other'
];

const StatusBadge = ({ status }) => {
  const classMap = { 'Pending': 'badge badge-pending', 'Paid': 'badge badge-paid', 'Disputed': 'badge badge-disputed', 'Cancelled': 'badge badge-cancelled' };
  return <span className={classMap[status] || 'badge'}>{status}</span>;
};

const ConfirmModal = ({ violation, onConfirm, onCancel, loading }) => (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h3 className="modal-title">Delete Violation</h3>
        <button className="btn btn-ghost btn-icon" onClick={onCancel}><FiX /></button>
      </div>
      <div className="modal-body">
        <p style={{ color: '#334155', marginBottom: 8 }}>Are you sure you want to delete this violation?</p>
        <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, fontSize: 14 }}>
          <strong>{violation?.vehicleNumber}</strong> — {violation?.violationType}<br />
          <span style={{ color: '#64748b' }}>Fine: ₹{violation?.fineAmount?.toLocaleString('en-IN')}</span>
        </div>
        <p style={{ fontSize: 13, color: '#dc2626', marginTop: 8 }}>This action cannot be undone.</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

const ViolationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [violations, setViolations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchViolations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('violationType', typeFilter);

      const response = await api.get(`/violations?${params}`);
      setViolations(response.data.violations);
      setPagination(response.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch violations');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  // Fetch when filters change
  useEffect(() => {
    const timer = setTimeout(fetchViolations, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchViolations]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/violations/${deleteModal._id}`);
      toast.success('Violation deleted successfully');
      setDeleteModal(null);
      fetchViolations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete';
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || typeFilter;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">All Violations</h1>
          <p className="page-subtitle">
            {pagination.totalCount !== undefined ? `${pagination.totalCount} total records` : 'Loading...'}
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('/violations/add')}>
          <FiPlus /> Add Violation
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div className="search-bar" style={{ maxWidth: 260 }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicle no..."
            />
            {search && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearch('')}>
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Disputed">Disputed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Type filter */}
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 180 }}
          >
            <option value="">All Types</option>
            {VIOLATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <FiX /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Violations Table */}
      <div className="card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : violations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No violations found</h3>
            <p>{hasFilters ? 'Try adjusting your search filters' : 'No violations have been recorded yet'}</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle No.</th>
                    <th>Violation Type</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Fine (₹)</th>
                    <th>Status</th>
                    <th>Officer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((violation, index) => (
                    <tr key={violation._id}>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>
                        {(page - 1) * 10 + index + 1}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a3a5c', fontSize: 13, background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>
                          {violation.vehicleNumber}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{violation.violationType}</td>
                      <td style={{ fontSize: 13, color: '#475569' }}>
                        {new Date(violation.date).toLocaleDateString('en-IN')}<br />
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>{violation.time}</span>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {violation.location}
                      </td>
                      <td style={{ fontWeight: 700, color: '#1a3a5c' }}>
                        ₹{violation.fineAmount.toLocaleString('en-IN')}
                      </td>
                      <td><StatusBadge status={violation.status} /></td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>
                        {violation.officerName || violation.recordedBy?.name || 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => navigate(`/violations/edit/${violation._id}`)}
                            title="Edit"
                            style={{ color: '#2563a8' }}
                          >
                            <FiEdit2 size={15} />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => setDeleteModal(violation)}
                              title="Delete"
                              style={{ color: '#dc2626' }}
                            >
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.totalCount)} of {pagination.totalCount}
                </span>
                <div className="pagination-controls">
                  <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}>
                    ‹
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}>
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <ConfirmModal
          violation={deleteModal}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ViolationList;
