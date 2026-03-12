/**
 * EditViolation.js
 * Page for editing an existing violation.
 * Loads violation data from API then passes to form.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ViolationForm from './ViolationForm';
import api from '../../utils/api';

const EditViolation = () => {
  const { id } = useParams(); // Get violation ID from URL
  const navigate = useNavigate();
  const [violation, setViolation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchViolation = async () => {
      try {
        const response = await api.get(`/violations/${id}`);
        setViolation(response.data.violation);
      } catch (err) {
        setError('Failed to load violation. It may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchViolation();
  }, [id]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (error) {
    return (
      <div>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-outline" onClick={() => navigate('/violations')}>
          ← Back to Violations
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Violation</h1>
          <p className="page-subtitle">
            Editing record for vehicle: <strong>{violation?.vehicleNumber}</strong>
          </p>
        </div>
      </div>
      <ViolationForm
        initialData={violation}
        isEdit={true}
        violationId={id}
      />
    </div>
  );
};

export default EditViolation;
