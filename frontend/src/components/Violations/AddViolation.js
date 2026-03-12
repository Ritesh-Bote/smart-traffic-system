/**
 * AddViolation.js
 * Page for recording a new traffic violation.
 */

import React from 'react';
import ViolationForm from './ViolationForm';

const AddViolation = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Record New Violation</h1>
          <p className="page-subtitle">Fill in the details to record a traffic violation</p>
        </div>
      </div>
      <ViolationForm />
    </div>
  );
};

export default AddViolation;
