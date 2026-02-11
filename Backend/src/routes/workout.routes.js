import { Router } from "express";
import {
  createWorkoutPlan,
  fetchActiveWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from "../controllers/workout.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as workoutValidation from "../validations/workout.validation.js";

const router = Router();

router.post("/plan", protect, validate(workoutValidation.createWorkoutPlan), createWorkoutPlan);
router.get("/plan", protect, fetchActiveWorkoutPlan);

router.put("/plan", protect, validate(workoutValidation.updateWorkoutPlan), updateWorkoutPlan);
router.delete("/plan", protect, validate(workoutValidation.deleteWorkoutPlan), deleteWorkoutPlan);


export default router;
