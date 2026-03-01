import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';

export const updateAvatar = catchAsync(async (req, res) => {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        { new: true, runValidators: true }
    ).select('-password -tokens');
    res.send(user);
});
export const updateTheme = catchAsync(async (req, res) => {
    const { theme } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { theme },
        { new: true, runValidators: true }
    );
    res.send(user);
});

export const updateNutrition = catchAsync(async (req, res) => {
    const { nutritionProfile } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { nutritionProfile },
        { new: true, runValidators: true }
    );
    res.send(user);
});

export const getProfile = catchAsync(async (req, res) => {
    res.send(req.user);
});

export default {
    updateAvatar,
    updateTheme,
    updateNutrition,
    getProfile,
};
