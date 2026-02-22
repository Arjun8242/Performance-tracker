import Joi from 'joi';

const adjustPlan = {
    body: Joi.object().keys({
        goal: Joi.string().required().valid('hypertrophy', 'strength', 'endurance'),
        strictMode: Joi.boolean().required(),
    }),
};

const chat = {
    body: Joi.object().keys({
        message: Joi.string().required().min(1).max(1000).trim(),
    }),
};

const clearChat = {
    body: Joi.object().keys({}), // empty body allowed
};

export default {
    adjustPlan,
    chat,
    clearChat,
};
