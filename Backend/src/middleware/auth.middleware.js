import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/user.model.js';

/**
 * Authentication Middleware
 * 
 * Extracts and verifies JWT from Authorization header
 * Attaches fully populated req.user for downstream handlers
 */

/**
 * Protect routes - require valid JWT
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
const protect = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Access denied. No token provided');
        }

        // Get token from "Bearer <token>"
        const token = authHeader.split(' ')[1];

        // Verify token and extract payload
        const decoded = verifyToken(token);

        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
        }

        // Attach user to request for use in route handlers
        req.user = user;
        // Backward compatibility if mostly userId is used, but now we have full user
        req.user.userId = user._id;

        next();
    } catch (error) {
        // Handle specific JWT errors with generic messages
        // Don't reveal internal error details to potential attackers
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
        }

        // Pass through ApiErrors as-is
        if (error instanceof ApiError) {
            return next(error);
        }

        // Generic error for unexpected issues
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication failed'));
    }
};

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to perform this action'));
        }
        next();
    };
};

export { protect, restrictTo };
