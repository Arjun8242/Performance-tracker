import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/token.js';
import { sendOtpEmail } from './emailService.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const generate6DigitOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Register a new user or update an unverified user's OTP
 */
const signup = async (userBody) => {
    const { email, password } = userBody;

    // Basic verification of required fields
    if (!email || !password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
        if (user.isVerified) {
            throw new ApiError(httpStatus.CONFLICT, 'Email already registered and verified');
        }
        // Fix for lockout: Update unverified user with new password and OTP
        user.password = password;
    } else {
        // Create new user
        user = new User({
            ...userBody,
            email: normalizedEmail,
        });
    }

    const rawOtp = generate6DigitOtp();
    user.otpHash = await bcrypt.hash(rawOtp, 12);
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);

    await user.save();

    // Send email async
    sendOtpEmail({ to: user.email, otp: rawOtp }).catch((e) =>
        console.error(`OTP email failed for ${user.email}:`, e.message)
    );

    return { message: 'OTP sent to email' };
};

/**
 * Verify OTP
 */
const verifyOTP = async (email, otp) => {
    if (!email || !otp) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email and OTP are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otpHash +otpExpires');
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.otpHash || !user.otpExpires) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No active OTP found. Please request a new one.');
    }

    if (user.otpExpires < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired. Request a new one.');
    }

    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpires = null;
    await user.save();

    return { message: 'Email verified successfully' };
};

/**
 * Resend OTP
 */
const resendOTP = async (email) => {
    if (!email) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (user.isVerified) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already verified');
    }

    const rawOtp = generate6DigitOtp();
    user.otpHash = await bcrypt.hash(rawOtp, 12);
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);

    await user.save();

    sendOtpEmail({ to: user.email, otp: rawOtp }).catch((e) =>
        console.error(`Resend OTP email failed for ${user.email}:`, e.message)
    );

    return { message: 'New OTP sent to email' };
};

/**
 * Login user
 */
const login = async (email, password) => {
    if (!email || !password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    if (!user.isVerified) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Please verify your email before logging in');
    }

    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    const token = generateToken(user._id.toString());
    return { user, token };
};

export default {
    signup,
    login,
    verifyOTP,
    resendOTP
};
