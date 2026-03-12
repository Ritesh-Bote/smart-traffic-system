/**
 * Citizen Controller
 *
 * Public-facing endpoints that don't require login.
 * Citizens can look up violations for their vehicle number.
 */

const Violation = require('../models/Violation');

/**
 * @route   GET /api/citizen/check/:vehicleNumber
 * @desc    Public endpoint - citizens check their violations
 * @access  Public (no login required)
 */
const checkViolations = async (req, res) => {
  try {
    const vehicleNumber = req.params.vehicleNumber.toUpperCase().trim();

    // Validate vehicle number format (basic check)
    if (!vehicleNumber || vehicleNumber.length < 4) {
      return res.status(400).json({
        message: 'Please provide a valid vehicle number'
      });
    }

    // Find all violations for this vehicle
    const violations = await Violation.find({ vehicleNumber })
      .select('-recordedBy -notes -__v')  // Hide sensitive fields from public
      .sort({ date: -1 });                 // Latest first

    // Calculate summary statistics
    const totalFine = violations.reduce((sum, v) => sum + v.fineAmount, 0);
    const pendingFine = violations
      .filter(v => v.status === 'Pending')
      .reduce((sum, v) => sum + v.fineAmount, 0);

    const statusBreakdown = violations.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      vehicleNumber,
      found: violations.length > 0,
      summary: {
        totalViolations: violations.length,
        totalFineAmount: totalFine,
        pendingFineAmount: pendingFine,
        statusBreakdown
      },
      violations
    });

  } catch (error) {
    console.error('Citizen check error:', error);
    res.status(500).json({ message: 'Server error while checking violations' });
  }
};

module.exports = { checkViolations };
