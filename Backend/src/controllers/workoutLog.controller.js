
import workoutLogService from '../services/workoutLog.service.js';
import ApiError from '../utils/ApiError.js';

const logWorkout = async (req, res, next) => {
  try {
    const { workoutId, date, status, performedExercises, notes } = req.body;
    const userId = req.user.userId;
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);


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
    const { from, to } = req.query;

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

    // 🔥 IMPORTANT: normalize date boundaries
    fromDate.setHours(0, 0, 0, 0);       // start of day
    toDate.setHours(23, 59, 59, 999);    // end of day

    const logs = await workoutLogService.fetchWorkoutLogs(
      userId,
      fromDate,
      toDate
    );

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};


export default {
  logWorkout,
  getWorkoutLogs,
};
