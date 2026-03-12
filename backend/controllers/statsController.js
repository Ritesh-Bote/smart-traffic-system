/**
 * Stats Controller
 *
 * Provides dashboard statistics and analytics data.
 * These are aggregated views of the violation data.
 */

const Violation = require('../models/Violation');

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get all dashboard statistics
 * @access  Protected
 */
const getDashboardStats = async (req, res) => {
  try {
    // Run all aggregation queries in parallel for performance
    const [
      totalViolations,
      statusCounts,
      violationTypeCounts,
      recentViolations,
      monthlyTrend,
      totalFineCollected,
      todayViolations
    ] = await Promise.all([

      // Total violation count
      Violation.countDocuments(),

      // Count by status (Pending, Paid, Disputed, Cancelled)
      Violation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Count by violation type
      Violation.aggregate([
        { $group: { _id: '$violationType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }  // Top 5 violation types
      ]),

      // Most recent 5 violations
      Violation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('vehicleNumber violationType fineAmount status date location'),

      // Monthly trend for last 6 months
      Violation.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            count: { $sum: 1 },
            totalFine: { $sum: '$fineAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Total fine amount from paid violations
      Violation.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$fineAmount' } } }
      ]),

      // Violations recorded today
      Violation.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    // Format status counts into a cleaner object
    const statusMap = {};
    statusCounts.forEach(item => {
      statusMap[item._id] = item.count;
    });

    // Format monthly trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      month: months[item._id.month - 1],
      year: item._id.year,
      count: item.count,
      totalFine: item.totalFine
    }));

    res.json({
      overview: {
        totalViolations,
        todayViolations,
        pendingViolations: statusMap['Pending'] || 0,
        paidViolations: statusMap['Paid'] || 0,
        disputedViolations: statusMap['Disputed'] || 0,
        totalFineCollected: totalFineCollected[0]?.total || 0
      },
      statusBreakdown: statusMap,
      topViolationTypes: violationTypeCounts,
      recentViolations,
      monthlyTrend: formattedMonthlyTrend
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
};

module.exports = { getDashboardStats };
