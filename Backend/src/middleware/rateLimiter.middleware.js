import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse by limiting the number of requests per IP
 */

/**
 * General rate limiter for all routes
 * 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for auth routes
 * 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests, even successful ones
});

/**
 * AI Analysis Limiter
 * 5 requests per 24 hours per user
 */
const aiAnalysisLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1000, // 5 requests per window
    message: {
        success: false,
        message: 'You have reached your AI analysis limit for today (5 per 24h). Try again tomorrow!',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `user-${req.user.id}`, // Limit by user if possible
});

/**
 * AI Chat Limiter
 * 20 messages per hour per user (cost protection for production)
 */
const aiChatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        message: 'You have reached your AI chat limit (20 messages/hour). Please wait before sending more.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `chat-user-${req.user.id}`,
});

export { generalLimiter, authLimiter, aiAnalysisLimiter, aiChatLimiter };
