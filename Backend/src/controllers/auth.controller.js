import httpStatus from 'http-status';
import authService from '../services/auth.service.js';
import config from '../config/env.js';

const COOKIE_OPTS = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'Lax', // For cross-port SPA on same-site. Use 'None' with secure=true for cross-site.
    path: '/',
};

export const register = async (req, res, next) => {
    try {
        const result = await authService.signup(req.body);
        res.status(httpStatus.CREATED).send(result);
    } catch (err) {
        next(err);
    }
};

export const verify = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const { user, token } = await authService.verifyOTP(email, otp);
        // Align cookie lifetime with JWT access token lifetime
        res.cookie('access_token', token, { ...COOKIE_OPTS, maxAge: config.jwt.accessExpirationMinutes * 60 * 1000 });
        res.status(httpStatus.OK).send({ message: 'Verified and logged in', user, token });
    } catch (err) {
        next(err);
    }
};

export const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.resendOTP(email);
        res.status(httpStatus.OK).send(result);
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);

        res.cookie('access_token', token, { ...COOKIE_OPTS, maxAge: config.jwt.accessExpirationMinutes * 60 * 1000 });
        res.status(httpStatus.OK).send({ message: 'Logged in', user, token });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res) => {
    res.clearCookie('access_token', COOKIE_OPTS);
    res.status(httpStatus.OK).send({ message: 'Logged out' });
};

export default { register, verify, resendOtp, login, logout };
