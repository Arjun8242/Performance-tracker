import * as exerciseService from '../services/exercise.service.js';

/**
 * Get exercises with filtering and pagination
 * GET /exercises
 */
const getExercises = async (req, res, next) => {
    try {
        const { muscleGroup, equipment, difficulty, category, search, page, limit } = req.query;

        const filter = {};

        // Exact matches for enums
        if (muscleGroup) filter.muscleGroup = muscleGroup;
        if (equipment) filter.equipment = equipment;
        if (difficulty) filter.difficulty = difficulty;
        if (category) filter.category = category;

        // Partial search for name
        if (search) {
            filter.name = { $regex: `^${search}`, $options: 'i' };
        }

        // Cap limit at 100
        const finalLimit = Math.min(parseInt(limit, 10) || 20, 100);
        const finalPage = parseInt(page, 10) || 1;

        const result = await exerciseService.queryExercises(filter, {
            limit: finalLimit,
            page: finalPage
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export {
    getExercises
};
