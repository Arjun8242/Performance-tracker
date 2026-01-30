
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

const getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);
        const maxLimit = 100;
        const effectiveLimit = Math.min(limitInt, maxLimit);
        const skip = (pageInt - 1) * effectiveLimit;

        const total = await User.countDocuments();
        const users = await User.find()
            .select('-password') // Exclude password
            .skip(skip)
            .limit(effectiveLimit);

        res.status(httpStatus.OK).json({
            page: pageInt,
            limit: effectiveLimit,
            total,
            totalPages: Math.ceil(total / effectiveLimit),
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

export { getUsers };
