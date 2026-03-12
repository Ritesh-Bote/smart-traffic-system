/**
 * Violation Model (MongoDB Schema)
 *
 * This defines the structure for traffic violation records.
 * Every time a police officer records a violation, it gets
 * stored in MongoDB following this schema.
 */

const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true,      // Always store in uppercase (e.g., "MH12AB1234")
      minlength: [4, 'Vehicle number too short'],
      maxlength: [20, 'Vehicle number too long']
    },
    violationType: {
      type: String,
      required: [true, 'Violation type is required'],
      enum: [
        'Signal Jump',
        'Over Speeding',
        'Wrong Parking',
        'No Helmet',
        'No Seat Belt',
        'Drunk Driving',
        'Wrong Side Driving',
        'Using Mobile While Driving',
        'Overloading',
        'No License',
        'No Insurance',
        'Triple Riding',
        'Other'
      ]
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [3, 'Location must be at least 3 characters'],
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    fineAmount: {
      type: Number,
      required: [true, 'Fine amount is required'],
      min: [0, 'Fine amount cannot be negative'],
      max: [100000, 'Fine amount seems too high']
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Disputed', 'Cancelled'],
      default: 'Pending'
    },
    driverName: {
      type: String,
      trim: true,
      maxlength: [100, 'Driver name cannot exceed 100 characters']
    },
    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    // Reference to the police officer who recorded this violation
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',          // Links to User model
      required: true
    },
    officerName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true   // Adds createdAt and updatedAt automatically
  }
);

// ==================== INDEXES ====================
// Indexes make searching faster in MongoDB

// Index on vehicleNumber for fast citizen lookups
violationSchema.index({ vehicleNumber: 1 });

// Index on date for time-based queries
violationSchema.index({ date: -1 });

// Compound index for common search patterns
violationSchema.index({ vehicleNumber: 1, date: -1 });

// ==================== VIRTUAL FIELDS ====================

/**
 * Virtual field: formatted date string
 * This doesn't get stored in DB, but can be accessed on the model
 */
violationSchema.virtual('formattedDate').get(function () {
  return this.date ? this.date.toLocaleDateString('en-IN') : '';
});

// Include virtuals when converting to JSON
violationSchema.set('toJSON', { virtuals: true });

const Violation = mongoose.model('Violation', violationSchema);
module.exports = Violation;
