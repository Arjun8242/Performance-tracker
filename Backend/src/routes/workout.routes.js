import { Router } from "express";
import {
  createWorkoutPlan,
  fetchActiveWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from "../controllers/workout.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/plan", protect, createWorkoutPlan);
router.get("/plan", protect, fetchActiveWorkoutPlan);

router.put("/plan/:planId", protect, updateWorkoutPlan);
router.delete("/plan/:planId", protect, deleteWorkoutPlan);


export default router;
