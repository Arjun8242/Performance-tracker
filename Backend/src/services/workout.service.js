import WorkoutPlan from "../models/workoutPlan.model.js";
import Exercise from "../models/Exercise.model.js";
import ApiError from '../utils/ApiError.js';


/**
 * Validate that all exercise IDs in the plan exist in the database.
 * @param {Array} workouts 
 * @throws {ApiError}
 */
const validateExerciseIds = async (workouts) => {
  const exerciseIds = new Set();
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      exerciseIds.add(exercise.exerciseId.toString());
    });
  });

  const uniqueIds = Array.from(exerciseIds);
  const existingCount = await Exercise.countDocuments({
    _id: { $in: uniqueIds },
    isActive: true
  });

  if (existingCount !== uniqueIds.length) {
    throw new ApiError(400, "One or more exercise IDs are invalid or inactive");
  }
};

const createWorkoutPlan = async (userId, planDetails) => {
  const { name, workouts } = planDetails;

  // Step 3: Add Validation Layer
  await validateExerciseIds(workouts);

  const existingPlan = await WorkoutPlan.findOne({ userId });
  if (existingPlan) {
    throw new ApiError(409, "A workout plan already exists for this user. Please update the existing plan instead.");
  }

  const workoutPlan = await WorkoutPlan.create({
    userId,
    name,
    workouts,
  });

  return workoutPlan;
};

const fetchActiveWorkoutPlan = async (userId) => {
  const plan = await WorkoutPlan.findOne({ userId }).populate({
    path: 'workouts.exercises.exerciseId',
    select: 'name muscleGroup equipment difficulty image'
  });

  if (!plan) {
    throw new ApiError(404, "No workout plan found for this user");
  }

  return plan;
};

const updateWorkoutPlan = async (userId, updateDetails) => {
  // Step 4: Protect Against Broken Updates
  const { name, workouts } = updateDetails;

  const plan = await WorkoutPlan.findOne({ userId });
  if (!plan) {
    throw new ApiError(404, "No workout plan found to update");
  }

  // Explicit update mapping
  if (name !== undefined) plan.name = name;

  if (workouts !== undefined) {
    await validateExerciseIds(workouts);
    plan.workouts = workouts;
  }

  await plan.save();

  return plan;
};

const deleteWorkoutPlan = async (userId) => {
  const plan = await WorkoutPlan.findOne({ userId });
  if (!plan) {
    throw new ApiError(404, "No workout plan found to delete");
  }

  await plan.deleteOne();

  return {
    message: "Workout plan deleted successfully",
  };
};

export {
  createWorkoutPlan,
  fetchActiveWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
};
