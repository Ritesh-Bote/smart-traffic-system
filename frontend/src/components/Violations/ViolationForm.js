/**
 * ViolationForm.js
 *
 * A reusable form component used by both AddViolation and EditViolation.
 * Handles:
 * - All form fields with validation
 * - Submit to backend API
 * - Error display
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api';

const VIOLATION_TYPES = [
  'Signal Jump', 'Over Speeding', 'Wrong Parking', 'No Helmet',
  'No Seat Belt', 'Drunk Driving', 'Wrong Side Driving',
  'Using Mobile While Driving', 'Overloading', 'No License',
  'No Insurance', 'Triple Riding', 'Other'
];

const FINE_PRESETS = {
  'Signal Jump': 1000,
  'Over Speeding': 2000,
  'Wrong Parking': 500,
  'No Helmet': 500,
  'No Seat Belt': 1000,
  'Drunk Driving': 10000,
  'Wrong Side Driving': 1000,
  'Using Mobile While Driving': 1500,
  'Overloading': 3000,
  'No License': 5000,
  'No Insurance': 2000,
  'Triple Riding': 1000,
  'Other': 500
};

const ViolationForm = ({ initialData = {}, isEdit = false, violationId = null }) => {
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for date input
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    vehicleNumber: initialData.vehicleNumber || '',
    violationType: initialData.violationType || '',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : today,
    time: initialData.time || currentTime,
    location: initialData.location || '',
    fineAmount: initialData.fineAmount || '',
    status: initialData.status || 'Pending',
    driverName: initialData.driverName || '',
    licenseNumber: initialData.licenseNumber || '',
    notes: initialData.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill fine amount when violation type changes
    if (name === 'violationType' && !isEdit) {
      setFormData(prev => ({ ...prev, [name]: value, fineAmount: FINE_PRESETS[value] || '' }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validation
  const validate = () => {
    const newErrors = {};

    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    else if (formData.vehicleNumber.trim().length < 4) newErrors.vehicleNumber = 'Vehicle number too short';

    if (!formData.violationType) newErrors.violationType = 'Please select a violation type';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.fineAmount) newErrors.fineAmount = 'Fine amount is required';
    else if (isNaN(formData.fineAmount) || Number(formData.fineAmount) < 0) newErrors.fineAmount = 'Enter a valid positive number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // True if no errors
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/violations/${violationId}`, formData);
        toast.success('Violation updated successfully!');
      } else {
        await api.post('/violations', formData);
        toast.success('Violation recorded successfully!');
      }
      navigate('/violations');
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred';
      const serverErrors = err.response?.data?.errors;

      if (serverErrors) {
        const fieldErrors = {};
        serverErrors.forEach(e => { fieldErrors[e.path] = e.msg; });
        setErrors(fieldErrors);
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{isEdit ? 'Edit Violation Details' : 'Violation Information'}</h2>
          <span style={{ fontSize: 13, color: '#64748b' }}>Fields marked <span style={{ color: '#dc2626' }}>*</span> are required</span>
        </div>
        <div className="card-body">

          {/* Section: Vehicle Information */}
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, color: '#1a3a5c', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
            🚗 Vehicle Information
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Vehicle Number <span className="required">*</span></label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className={`form-control ${errors.vehicleNumber ? 'error' : ''}`}
                placeholder="e.g., MH12AB1234"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.vehicleNumber && <div className="form-error">{errors.vehicleNumber}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                className="form-control"
                placeholder="Driver's full name (optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., MH1220240001234 (optional)"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          {/* Section: Violation Details */}
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, color: '#1a3a5c', margin: '24px 0 16px', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
            ⚠️ Violation Details
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Violation Type <span className="required">*</span></label>
              <select
                name="violationType"
                value={formData.violationType}
                onChange={handleChange}
                className={`form-control ${errors.violationType ? 'error' : ''}`}
              >
                <option value="">-- Select violation type --</option>
                {VIOLATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.violationType && <div className="form-error">{errors.violationType}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Date <span className="required">*</span></label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={today}
                className={`form-control ${errors.date ? 'error' : ''}`}
              />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Time <span className="required">*</span></label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`form-control ${errors.time ? 'error' : ''}`}
              />
              {errors.time && <div className="form-error">{errors.time}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Fine Amount (₹) <span className="required">*</span></label>
              <input
                type="number"
                name="fineAmount"
                value={formData.fineAmount}
                onChange={handleChange}
                className={`form-control ${errors.fineAmount ? 'error' : ''}`}
                placeholder="e.g., 1000"
                min="0"
              />
              {errors.fineAmount && <div className="form-error">{errors.fineAmount}</div>}
              {formData.violationType && (
                <div style={{ fontSize: 12, color: '#2563a8', marginTop: 4 }}>
                  💡 Suggested fine: ₹{FINE_PRESETS[formData.violationType]?.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Disputed">Disputed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location <span className="required">*</span></label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`form-control ${errors.location ? 'error' : ''}`}
              placeholder="e.g., MG Road Junction, near HDFC Bank, Mumbai"
            />
            {errors.location && <div className="form-error">{errors.location}</div>}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-control"
              rows={3}
              placeholder="Any additional observations or notes..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/violations')}
            disabled={loading}
          >
            <FiArrowLeft /> Cancel
          </button>
          <button
            type="submit"
            className="btn btn-accent"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>
                {isEdit ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <FiSave /> {isEdit ? 'Update Violation' : 'Save Violation'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ViolationForm;
