import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Auth Routes
 * 
 * POST /auth/signup - Register new user
 * POST /auth/login  - Authenticate user
 */

// Public routes (no authentication required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);

export default router;
