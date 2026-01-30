import Joi from 'joi';

/**
 * Progress Validation Schemas
 */

const getSummary = {
    query: Joi.object().keys({
        week: Joi.number().integer().min(1).optional().messages({
            'number.min': 'Week must be at least 1',
        }),
    }),
};

export { getSummary };
