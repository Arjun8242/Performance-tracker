import httpStatus from 'http-status';
import * as authService from '../services/auth.service.js';

/**
 * Auth Controller
 * 
 * Controllers are thin - they only:
 * 1. Extract data from request
 * 2. Call appropriate service
 * 3. Send response
 * 
 * NO business logic here - that belongs in services
 */

/**
 * Handle user registration
 * POST /auth/signup
 */
const signup = async (req, res, next) => {
    try {
        console.log(req.headers['content-type']);
console.log(req.body);

        const { email, password } = req.body;

        const token = await authService.signup(email, password);

        // Return only success status and token
        // Never return user object or any user data
        res.status(httpStatus.CREATED).json({
            success: true,
            token,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle user login
 * POST /auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const token = await authService.login(email, password);

        res.status(httpStatus.OK).json({
            success: true,
            token,
        });
    } catch (error) {
        next(error);
    }
};

export { signup, login };
