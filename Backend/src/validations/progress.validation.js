import Joi from 'joi';

/**
 * Progress Validation Schemas
 */

const getMonth = {
    query: Joi.object().keys({
        month: Joi.number().integer().min(0).max(11).optional(),
        year: Joi.number().integer().min(2000).max(2100).optional(),
    }),
};

const getSummary = {
    query: Joi.object().keys({
        week: Joi.number().integer().min(1).optional(),
    }),
};

const getExerciseAnalytics = {
    params: Joi.object().keys({
        exerciseId: Joi.string().required().custom((value, helpers) => {
            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                return helpers.message('"exerciseId" must be a valid mongo id');
            }
            return value;
        }),
    }),
};

export {
    getSummary,
    getMonth,
    getExerciseAnalytics
};
