import httpStatus from 'http-status';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/token.js';

/**
 * Auth Service
 * 
 * Why keep auth logic in services?
 * - Controllers handle HTTP request/response only
 * - Services contain business logic (reusable across controllers, tests, background jobs)
 * - Easy to unit test without HTTP layer
 * - Clean separation: routes → controllers → services → models
 * - Services can orchestrate multiple models and utilities
 */

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - Plain text password (hashed by model pre-save hook)
 * @returns {Promise<string>} JWT token
 * @throws {ApiError} 409 if email already exists, 400 for validation errors
 */
const signup = async (email, password) => {
    // Validate inputs
    if (!email || !password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email format');
    }

    // Password strength validation
    if (password.length < 8) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(httpStatus.CONFLICT, 'Email already registered');
    }

    // Create user (password is hashed by pre-save hook in user model)
    const user = await User.create({
        email: email.toLowerCase(),
        password,
    });

    // Generate token with minimal payload (userId only)
    const token = generateToken(user._id.toString());

    return token;
};

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<string>} JWT token
 * @throws {ApiError} 401 for invalid credentials (generic message to prevent enumeration)
 */
const login = async (email, password) => {
    // Validate inputs
    if (!email || !password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
    }

    // Find user and explicitly select password field (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Generic error message - don't reveal if email exists or not
    // This prevents user enumeration attacks
    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    // Verify password using model method
    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    // Generate token with minimal payload
    const token = generateToken(user._id.toString());

    return token;
};

export { signup, login };
