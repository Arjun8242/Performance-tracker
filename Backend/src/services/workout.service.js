import WorkoutPlan from "../models/workoutPlan.model.js";
import ApiError from "../utils/ApiError.js";

const EXERCISE_TEMPLATES = {
  beginner: [
    { name: "Push-ups", sets: 3, reps: 10, weight: 0 },
    { name: "Squats", sets: 3, reps: 12, weight: 0 },
    { name: "Dumbbell Rows", sets: 3, reps: 10, weight: 5 },
    { name: "Plank", sets: 3, reps: 30, weight: 0 },
  ],
  intermediate: [
    { name: "Bench Press", sets: 4, reps: 8, weight: 40 },
    { name: "Deadlifts", sets: 3, reps: 5, weight: 60 },
    { name: "Overhead Press", sets: 3, reps: 8, weight: 20 },
    { name: "Pull-ups", sets: 3, reps: 8, weight: 0 },
    { name: "Lunges", sets: 3, reps: 10, weight: 10 },
  ],
  advanced: [
    { name: "Barbell Squats", sets: 5, reps: 5, weight: 80 },
    { name: "Weighted Pull-ups", sets: 4, reps: 6, weight: 10 },
    { name: "Clean and Jerk", sets: 3, reps: 3, weight: 40 },
    { name: "Snatch", sets: 3, reps: 3, weight: 30 },
    { name: "Box Jumps", sets: 3, reps: 10, weight: 0 },
    { name: "Turkish Get-ups", sets: 3, reps: 4, weight: 15 },
  ],
};

const AVAILABLE_EQUIPMENT = [
  "dumbbell",
  "bench",
  "barbell",
  "pull-up bar",
  "kettlebell",
  "box",
];

const WORKOUT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const createWorkoutPlan = async (userId, planDetails) => {
  const {
    name,
    week,
    goal,// goal comes from user profile, not persisted in plan (v1)
    fitnessLevel,
    equipment
  } = planDetails;

  if (!name || !week || !goal || !fitnessLevel || !equipment) {
    throw new ApiError(400, "Missing required plan details");
  }

  // Validate equipment availability
  const unsupportedEquipment = equipment.filter(// Equipment is validated for correctness but not yet used in plan generation (v1)
    (item) => !AVAILABLE_EQUIPMENT.includes(item)
  );
  if (unsupportedEquipment.length > 0) {
    throw new ApiError(
      400,
      `Unsupported equipment: ${unsupportedEquipment.join(", ")}`
    );
  }

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

  let numWorkouts;
  switch (fitnessLevel) {
    case "beginner":
      numWorkouts = 3;
      break;
    case "intermediate":
      numWorkouts = 4;
      break;
    case "advanced":
      numWorkouts = 5;
      break;
    default:
      throw new ApiError(400, "Invalid fitness level");
  }

  const exercises = EXERCISE_TEMPLATES[fitnessLevel];
  if (!exercises || exercises.length === 0) {
    throw new ApiError(500, "No exercise templates found for this fitness level");
  }

  const workouts = [];
  for (let i = 0; i < numWorkouts; i++) {
    // Simple deterministic workout generation: select exercises based on index and fitness level
    // To ensure determinism and avoid AI/randomness, we can cycle through templates or pick a subset.
    // For simplicity, let's assign a fixed set of exercises for each workout based on the fitness level.
    const workoutExercises = exercises.map(ex => ({ ...ex })); // Deep copy exercises

    workouts.push({
      day: WORKOUT_DAYS[i % WORKOUT_DAYS.length], // Assign a day in a deterministic cycle
      name: `${fitnessLevel} Workout Day ${i + 1}`,
      exercises: workoutExercises,
    });
  }

  const workoutPlan = await WorkoutPlan.create({
    userId,
    name,
    week,
    goal,
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