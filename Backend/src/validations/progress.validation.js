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

export {
    getSummary,
    getMonth
};
