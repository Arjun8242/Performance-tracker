import * as workoutService from "../services/workout.service.js";
import ApiError from "../utils/ApiError.js";

const createWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const planDetails = req.body;
    const workoutPlan = await workoutService.createWorkoutPlan(
      userId,
      planDetails
    );
    res.status(201).json(workoutPlan);
  } catch (error) {
    next(error);
  }
};

const fetchActiveWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workoutPlan = await workoutService.fetchActiveWorkoutPlan(userId);
    res.status(200).json(workoutPlan);
  } catch (error) {
    next(error);
  }
};

const updateWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.params;
    const updateDetails = req.body;

    // Do NOT allow changing userId or week - handled in service logic if needed, but explicitly exclude from controller input here
    delete updateDetails.userId;
    delete updateDetails.week;

    const updatedPlan = await workoutService.updateWorkoutPlan(
      planId,
      userId,
      updateDetails
    );
    res.status(200).json(updatedPlan);
  } catch (error) {
    next(error);
  }
};

const deleteWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.params;
    const result = await workoutService.deleteWorkoutPlan(planId, userId);
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