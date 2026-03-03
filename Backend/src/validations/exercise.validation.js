import Joi from 'joi';

const getExercises = {
  query: Joi.object().keys({
    muscleGroup: Joi.string().trim().max(50).optional(),
    equipment: Joi.string().trim().max(50).optional(),
    difficulty: Joi.string().trim().max(50).optional(),
    category: Joi.string().trim().max(50).optional(),
    search: Joi.string().trim().max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export { getExercises };
