
import WorkoutLog from '../models/workoutLog.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import Exercise from '../models/Exercise.model.js';
import ApiError from '../utils/ApiError.js';

const logWorkout = async (
  userId,
  workoutId,
  date,
  status,
  performedExercises,
  notes
) => {
  // 1. Normalize and Validate Date (Strict Today/Yesterday rule)
  const logDate = new Date(date);
  logDate.setUTCHours(0, 0, 0, 0);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);

  if (logDate.getTime() > today.getTime()) {
    throw new ApiError(400, "Cannot log workouts for the future");
  }

  if (logDate.getTime() !== today.getTime() && logDate.getTime() !== yesterday.getTime()) {
    throw new ApiError(400, "Strict Performance Rule: You can only log workouts for Today or Yesterday");
  }

  // 2. Fetch Plan and Check Ownership + Day Mapping
  const workoutPlan = await WorkoutPlan.findOne({
    userId,
    "workouts._id": workoutId,
  });

  if (!workoutPlan) {
    throw new ApiError(404, "Workout does not belong to your current plan");
  }

  // Strict Day Mapping
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const logDayName = daysOfWeek[logDate.getUTCDay()];
  const workout = workoutPlan.workouts.id(workoutId);

  if (workout.day.toLowerCase() !== logDayName.toLowerCase()) {
    throw new ApiError(400, `Strict Day Mapping: This workout is scheduled for ${workout.day}, but you are logging for ${logDayName}`);
  }

  // Enrich performedExercises with exercise details (name, muscleGroup)
  const enrichedExercises = await Promise.all(
    performedExercises.map(async (ex) => {
      const exercise = await Exercise.findById(ex.exerciseId).select('name muscleGroup');
      return {
        exerciseId: ex.exerciseId,
        name: exercise?.name || 'Exercise',
        muscleGroup: exercise?.muscleGroup || null,
        sets: ex.sets,
      };
    })
  );

  // 3. Idempotent log (One log per workout per date)
  const existingLog = await WorkoutLog.findOne({
    userId,
    workoutId,
    date: logDate,
  });

  if (existingLog) {
    existingLog.status = status;
    existingLog.performedExercises = enrichedExercises;
    existingLog.notes = notes;
    await existingLog.save();
    return existingLog;
  }

  return WorkoutLog.create({
    userId,
    workoutId,
    date: logDate,
    status,
    performedExercises: enrichedExercises,
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

  // Fetch paginated logs (exercise names are now stored directly)
  const logs = await WorkoutLog.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Manual population for workoutId (since it's a subdocument ID in WorkoutPlan)
  const userPlan = await WorkoutPlan.findOne({ userId });
  const workoutMap = userPlan ? Object.fromEntries(userPlan.workouts.map(w => [w._id.toString(), w])) : {};

  const enrichedLogs = logs.map(log => {
    const workoutInfo = log.workoutId ? workoutMap[log.workoutId.toString()] : null;
    if (workoutInfo) {
      log.workoutId = {
        _id: workoutInfo._id,
        name: workoutInfo.name,
        day: workoutInfo.day
      };
    }
    return log;
  });

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: enrichedLogs,
  };
};

export default {
  logWorkout,
  fetchWorkoutLogs,
};
