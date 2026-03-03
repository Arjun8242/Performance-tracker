import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';

export const updateAvatar = catchAsync(async (req, res) => {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        { new: true, runValidators: true }
    ).select('-password -otpHash');
    res.json(user.toJSON());
});

export const updateTheme = catchAsync(async (req, res) => {
    const { theme } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { theme },
        { new: true, runValidators: true }
    ).select('-password -otpHash');
    res.json(user.toJSON());
});

export const updateNutrition = catchAsync(async (req, res) => {
    const { nutritionProfile } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { nutritionProfile },
        { new: true, runValidators: true }
    ).select('-password -otpHash');
    res.json(user.toJSON());
});

export const getProfile = catchAsync(async (req, res) => {
    // Re-fetch to ensure sensitive fields are excluded
    const user = await User.findById(req.user._id).select('-password -otpHash');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    res.json(user.toJSON());
});

export default {
    updateAvatar,
    updateTheme,
    updateNutrition,
    getProfile,
};
