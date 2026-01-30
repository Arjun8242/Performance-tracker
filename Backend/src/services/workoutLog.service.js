
import WorkoutLog from '../models/workoutLog.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import ApiError from '../utils/ApiError.js';

const logWorkout = async (
  userId,
  workoutId,
  date,
  status,
  performedExercises,
  notes
) => {
  // Normalize date
  const logDate = new Date(date);
  logDate.setUTCHours(0, 0, 0, 0);

  // Validate workout ownership (embedded workout)
  const workoutPlan = await WorkoutPlan.findOne({
    userId,
    "workouts._id": workoutId,
  });

  if (!workoutPlan) {
    throw new ApiError(404, "Workout does not belong to the user");
  }

  // Idempotent log
  const existingLog = await WorkoutLog.findOne({
    userId,
    workoutId,
    date: logDate,
  });

  if (existingLog) {
    existingLog.status = status;
    existingLog.performedExercises = performedExercises;
    existingLog.notes = notes;
    await existingLog.save();
    return existingLog;
  }

  return WorkoutLog.create({
    userId,
    workoutId,
    date: logDate,
    status,
    performedExercises,
    notes,
  });
};


const fetchWorkoutLogs = async (userId, fromDate, toDate, page = 1, limit = 10) => {
  const query = {
    userId,
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Get total count for pagination metadata
  const total = await WorkoutLog.countDocuments(query);

  // Fetch paginated logs
  const logs = await WorkoutLog.find(query)
    .sort({ date: -1 }) // Most recent first
    .skip(skip)
    .limit(limit);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: logs,
  };
};

export default {
  logWorkout,
  fetchWorkoutLogs,
};
