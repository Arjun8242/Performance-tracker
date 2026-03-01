import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import * as authValidation from '../validations/auth.validation.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';


const router = express.Router();

// Register -> sends OTP to email
router.post('/register', authLimiter, validate(authValidation.signup), authController.register);

// Verify OTP
router.post('/verify', authLimiter, validate(authValidation.verify), authController.verify);

// Resend OTP
router.post('/resend-otp', authLimiter, validate(authValidation.resendOtp), authController.resendOtp);

// Login (requires verified email)
router.post('/login', authLimiter, validate(authValidation.login), authController.login);

// Logout
router.post('/logout', authController.logout);

export default router;
