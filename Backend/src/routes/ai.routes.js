import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import aiController from '../controllers/ai.controller.js';
import { aiAnalysisLimiter, aiChatLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import aiValidation from '../validations/ai.validation.js';

const router = express.Router();

// All AI routes require authentication
router.use(protect);

/**
 * GET /ai/context
 * Returns structured user performance data
 */
router.get('/context', aiController.getContext);

/**
 * POST /ai/analyze
 * Performance analysis — strict JSON output, rate limited 24h
 */
router.post('/analyze', aiAnalysisLimiter, validate(aiValidation.analyze), aiController.analyzePerformance);

/**
 * POST /ai/adjust-plan
 * Plan adjustment suggestions — strict JSON output
 */
router.post('/adjust-plan', validate(aiValidation.adjustPlan), aiController.adjustPlan);

/**
 * GET  /ai/chat  — Fetch chat history
 * POST /ai/chat  — Send message to AI coach (plain text, rate limited 20/hr)
 * DELETE /ai/chat — Clear chat history
 */
router.get('/chat', aiController.getChatHistory);
router.post('/chat', aiChatLimiter, validate(aiValidation.chat), aiController.chat);
router.delete('/chat', aiController.clearChat);

export default router;
