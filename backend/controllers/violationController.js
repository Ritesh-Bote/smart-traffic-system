/**
 * Violation Controller
 *
 * Handles all CRUD operations for traffic violations:
 * - Create: Add new violation record
 * - Read: Get all violations, get single violation
 * - Update: Edit violation details
 * - Delete: Remove violation record
 * - Search: Search by vehicle number
 */

const { validationResult } = require('express-validator');
const Violation = require('../models/Violation');

/**
 * @route   POST /api/violations
 * @desc    Create a new violation record
 * @access  Protected (police/admin)
 */
const createViolation = async (req, res) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      vehicleNumber, violationType, date, time,
      location, fineAmount, status, driverName,
      licenseNumber, notes
    } = req.body;

    // Create violation with reference to logged-in officer
    const violation = await Violation.create({
      vehicleNumber: vehicleNumber.toUpperCase(),
      violationType,
      date,
      time,
      location,
      fineAmount,
      status: status || 'Pending',
      driverName,
      licenseNumber: licenseNumber ? licenseNumber.toUpperCase() : undefined,
      notes,
      recordedBy: req.user._id,        // From protect middleware
      officerName: req.user.name        // Store name for quick access
    });

    res.status(201).json({
      message: 'Violation recorded successfully',
      violation
    });

  } catch (error) {
    console.error('Create violation error:', error);
    res.status(500).json({ message: 'Server error while creating violation' });
  }
};

/**
 * @route   GET /api/violations
 * @desc    Get all violations with filtering and pagination
 * @access  Protected
 */
const getAllViolations = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const {
      page = 1,
      limit = 10,
      search,
      status,
      violationType,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build the filter object
    const filter = {};

    // Search by vehicle number (case-insensitive partial match)
    if (search) {
      filter.vehicleNumber = { $regex: search.toUpperCase(), $options: 'i' };
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by violation type
    if (violationType) {
      filter.violationType = violationType;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort direction
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries in parallel for efficiency
    const [violations, totalCount] = await Promise.all([
      Violation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('recordedBy', 'name email badgeNumber'), // Join with User data
      Violation.countDocuments(filter)
    ]);

    res.json({
      violations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + violations.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({ message: 'Server error while fetching violations' });
  }
};

/**
 * @route   GET /api/violations/:id
 * @desc    Get a single violation by ID
 * @access  Protected
 */
const getViolationById = async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id)
      .populate('recordedBy', 'name email badgeNumber');

    if (!violation) {
      return res.status(404).json({ message: 'Violation not found' });
    }

    res.json({ violation });

  } catch (error) {
    // Handle invalid MongoDB ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid violation ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/violations/:id
 * @desc    Update a violation record
 * @access  Protected
 */
const updateViolation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find and update the violation
    const violation = await Violation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, vehicleNumber: req.body.vehicleNumber?.toUpperCase() },
      {
        new: true,          // Return updated document (not original)
        runValidators: true // Run schema validations on update
      }
    );

    if (!violation) {
      return res.status(404).json({ message: 'Violation not found' });
    }

    res.json({
      message: 'Violation updated successfully',
      violation
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid violation ID format' });
    }
    res.status(500).json({ message: 'Server error while updating' });
  }
};

/**
 * @route   DELETE /api/violations/:id
 * @desc    Delete a violation record
 * @access  Protected (Admin only)
 */
const deleteViolation = async (req, res) => {
  try {
    const violation = await Violation.findByIdAndDelete(req.params.id);

    if (!violation) {
      return res.status(404).json({ message: 'Violation not found' });
    }

    res.json({
      message: 'Violation deleted successfully',
      deletedViolation: violation
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid violation ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting' });
  }
};

/**
 * @route   GET /api/violations/search/:vehicleNumber
 * @desc    Search violations by vehicle number
 * @access  Protected
 */
const searchByVehicle = async (req, res) => {
  try {
    const vehicleNumber = req.params.vehicleNumber.toUpperCase();

    const violations = await Violation.find({
      vehicleNumber: { $regex: vehicleNumber, $options: 'i' }
    }).sort({ date: -1 });

    res.json({
      vehicleNumber,
      count: violations.length,
      violations
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during search' });
  }
};

module.exports = {
  createViolation,
  getAllViolations,
  getViolationById,
  updateViolation,
  deleteViolation,
  searchByVehicle
};
