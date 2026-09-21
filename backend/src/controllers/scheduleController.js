const Schedule = require('../models/Schedule');
const VerificationApplication = require('../models/VerificationApplication');
const { ROLES } = require('../config/constants');

// @desc    Get schedules
// @route   GET /api/schedules
// @access  Private
const getSchedules = async (req, res, next) => {
  try {
    const { startDate, endDate, officerId, gatcId } = req.query;
    const query = {};

    if (req.user.role === ROLES.LMO) {
      query.officer = req.user._id;
    } else if (req.user.role === ROLES.GATC) {
      query.gatc = req.user._id;
    }

    if (officerId) query.officer = officerId;
    if (gatcId) query.gatc = gatcId;

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const schedules = await Schedule.find(query)
      .populate('officer', 'name email officerBadgeNumber jurisdiction')
      .populate('gatc', 'name gatcCentreName')
      .populate({
        path: 'application',
        populate: [
          { path: 'applicant', select: 'name organization phone' },
          { path: 'instrument', select: 'instrumentId instrumentType manufacturer model location' }
        ]
      })
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: schedules.length,
      schedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule or update inspection schedule
// @route   PUT /api/schedules/:id
// @access  Private (LMO, GATC, SUPER_ADMIN)
const updateSchedule = async (req, res, next) => {
  try {
    const { date, startTime, endTime, notes, status, rescheduledReason } = req.body;
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    if (date) schedule.date = new Date(date);
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (notes) schedule.notes = notes;
    if (status) schedule.status = status;
    if (rescheduledReason) schedule.rescheduledReason = rescheduledReason;

    await schedule.save();

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchedules,
  updateSchedule
};
