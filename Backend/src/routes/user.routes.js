import express from 'express';
import userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/avatar', userController.updateAvatar);
router.put('/theme', userController.updateTheme);
router.put('/nutrition', userController.updateNutrition);

export default router;
