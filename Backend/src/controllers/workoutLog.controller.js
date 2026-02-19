
import workoutLogService from '../services/workoutLog.service.js';
import ApiError from '../utils/ApiError.js';

const logWorkout = async (req, res, next) => {
  try {
    const { workoutId, date, status, performedExercises, notes } = req.body;
    const userId = req.user.userId;

    if (!workoutId || !date || !status) {
      throw new ApiError(400, 'Workout ID, date, and status are required');
    }

    if (status === 'skipped' && performedExercises && performedExercises.length > 0) {
      throw new ApiError(400, 'Performed exercises must be empty if status is skipped');
    }

    const workoutLog = await workoutLogService.logWorkout(
      userId,
      workoutId,
      date,
      status,
      performedExercises || [],
      notes
    );
    res.status(200).json(workoutLog);
  } catch (error) {
    next(error);
  }
};

const getWorkoutLogs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { from, to, page = 1, limit = 10 } = req.query;

    let fromDate = from
      ? new Date(from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    let toDate = to
      ? new Date(to)
      : new Date();

    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD.");
    }

    // Handle edge case: from > to
    if (fromDate > toDate) {
      throw new ApiError(400, "From date cannot be after to date.");
    }

    // 🔥 IMPORTANT: normalize date boundaries using UTC to match how logs are stored
    fromDate.setUTCHours(0, 0, 0, 0);       // start of day UTC
    toDate.setUTCHours(23, 59, 59, 999);    // end of day UTC

    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const maxLimit = 100;
    const effectiveLimit = Math.min(limitInt, maxLimit);

    const result = await workoutLogService.fetchWorkoutLogs(
      userId,
      fromDate,
      toDate,
      pageInt,
      effectiveLimit
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export default {
  logWorkout,
  getWorkoutLogs,
};
