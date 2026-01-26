
import WorkoutLog from '../models/workoutLog.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import ApiError from '../utils/ApiError.js';

const logWorkout = async (userId, workoutId, date, status, performedExercises, notes) => {
  // Validate workoutId ownership
  console.log("userId:", userId);
console.log("workoutId:", workoutId);
const plans = await WorkoutPlan.find({ userId });
console.log("Plans for user:", JSON.stringify(plans, null, 2));


  const workoutPlan = await WorkoutPlan.findOne({ "workouts._id": workoutId, userId });
  if (!workoutPlan) {
    throw new ApiError(404, 'Workout plan not found or does not belong to the user');
  }

  // Check for existing log to ensure idempotency
  const existingLog = await WorkoutLog.findOne({ userId, workoutId, date });

  if (existingLog) {
    // Update existing log
    existingLog.status = status;
    existingLog.performedExercises = performedExercises;
    existingLog.notes = notes;
    await existingLog.save();
    return existingLog;
  } else {
    // Create new log
    const newLog = await WorkoutLog.create({
      userId,
      workoutId,
      date,
      status,
      performedExercises,
      notes,
    });
    return newLog;
  }
};

const fetchWorkoutLogs = async (userId, fromDate, toDate) => {
  const query = {
    userId,
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  const logs = await WorkoutLog.find(query).sort({ date: 1 });
  console.log("Fetched logs:", logs);
  return logs;
};

export default {
  logWorkout,
  fetchWorkoutLogs,
};
