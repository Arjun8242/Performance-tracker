import * as workoutService from "../services/workout.service.js";
import ApiError from "../utils/ApiError.js";

const createWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, workouts } = req.body;

    const workoutPlan = await workoutService.createWorkoutPlan(
      userId,
      { name, workouts }
    );
    res.status(201).json(workoutPlan);
  } catch (error) {
    next(error);
  }
};

const fetchActiveWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workoutPlan = await workoutService.fetchActiveWorkoutPlan(userId);
    res.status(200).json(workoutPlan);
  } catch (error) {
    next(error);
  }
};

const updateWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, workouts } = req.body;

    const updatedPlan = await workoutService.updateWorkoutPlan(
      userId,
      { name, workouts}
    );
    res.status(200).json(updatedPlan);
  } catch (error) {
    next(error);
  }
};

const deleteWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await workoutService.deleteWorkoutPlan(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export {
  createWorkoutPlan,
  fetchActiveWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
};