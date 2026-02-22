import httpStatus from 'http-status';
import authService from '../services/auth.service.js';

const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
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
        const result = await authService.verifyOTP(email, otp);
        res.status(httpStatus.OK).send(result);
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

        res.cookie('access_token', token, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
        res.status(httpStatus.OK).send({ message: 'Logged in', user });
    } catch (err) {
        next(err);
    }
};

export default { register, verify, resendOtp, login };
