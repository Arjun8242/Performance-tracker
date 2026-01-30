import WorkoutPlan from "../models/workoutPlan.model.js";
import ApiError from "../utils/ApiError.js";


const createWorkoutPlan = async (userId, planDetails) => {
  const { name, week, workouts } = planDetails;

  // Check for existing plan for the user and week
  const existingPlan = await WorkoutPlan.findOne({
    userId,
    week
  });

  if (existingPlan) {
    throw new ApiError(
      409,
      `Workout plan for week ${week} already exists for this user`
    );
  }

  const workoutPlan = await WorkoutPlan.create({
    userId,
    name,
    week,
    workouts,
  });

  return workoutPlan;
};

const fetchActiveWorkoutPlan = async (userId) => {
  const latestPlan = await WorkoutPlan.findOne({ userId }).sort({ createdAt: -1 });
  if (!latestPlan) {
    throw new ApiError(404, "No workout plan found for this user");
  }
  return latestPlan;
};

const updateWorkoutPlan = async (planId, userId, updateDetails) => {
  const { name, workouts } = updateDetails;

  if (!name && !workouts) {
    throw new ApiError(400, "No update data provided");
  }

  const plan = await WorkoutPlan.findOne({ _id: planId, userId });
  if (!plan) {
    throw new ApiError(404, "Workout plan not found or does not belong to the user");
  }

  if (name) {
    plan.name = name;
  }

  if (workouts) {
    // Basic validation for workouts structure if provided
    if (!Array.isArray(workouts) || workouts.some(w => !w.name || !Array.isArray(w.exercises) || w.exercises.some(e => !e.name || !e.sets || !e.reps))) {
      throw new ApiError(400, "Invalid workouts structure");
    }
    plan.workouts = workouts;
  }

  await plan.save();
  return plan;
};

const deleteWorkoutPlan = async (planId, userId) => {
  const plan = await WorkoutPlan.findOne({ _id: planId, userId });
  if (!plan) {
    throw new ApiError(404, "Workout plan not found or does not belong to the user");
  }

  await plan.deleteOne();
  return { message: "Workout plan deleted successfully" };
};

export {
  createWorkoutPlan,
  fetchActiveWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
};