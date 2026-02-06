import Joi from 'joi';
import { objectId } from '../middleware/validate.middleware.js';

/**
 * Workout Plan Validation Schemas
 */

const exerciseSchema = Joi.object().keys({
    name: Joi.string().trim().required().messages({
        'any.required': 'Exercise name is required',
        'string.empty': 'Exercise name cannot be empty',
    }),
    sets: Joi.number().integer().min(1).required().messages({
        'any.required': 'Sets is required',
        'number.min': 'Sets must be at least 1',
    }),
    reps: Joi.number().integer().min(1).required().messages({
        'any.required': 'Reps is required',
        'number.min': 'Reps must be at least 1',
    }),
    weight: Joi.number().min(0).optional().messages({
        'number.min': 'Weight cannot be negative',
    }),
});

const workoutSchema = Joi.object().keys({
    day: Joi.string().trim().required().messages({
        'any.required': 'Day is required',
        'string.empty': 'Day cannot be empty',
    }),
    name: Joi.string().trim().required().messages({
        'any.required': 'Workout name is required',
        'string.empty': 'Workout name cannot be empty',
    }),
    exercises: Joi.array().items(exerciseSchema).min(1).required().messages({
        'any.required': 'Exercises array is required',
        'array.min': 'At least one exercise is required',
    }),
});

const createWorkoutPlan = {
    body: Joi.object().keys({
        name: Joi.string().trim().required().messages({
            'any.required': 'Plan name is required',
            'string.empty': 'Plan name cannot be empty',
        }),
        week: Joi.number().integer().min(1).required().messages({
            'any.required': 'Week number is required',
            'number.min': 'Week must be at least 1',
        }),
        workouts: Joi.array().items(workoutSchema).min(1).required().messages({
            'any.required': 'Workouts array is required',
            'array.min': 'At least one workout is required',
        }),
    }),
};

const updateWorkoutPlan = {
    params: Joi.object().keys({
        planId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Plan ID is required',
            'any.invalid': 'Plan ID must be a valid MongoDB ObjectId',
        }),
    }),
    body: Joi.object().keys({
        name: Joi.string().trim().optional(),
        week: Joi.number().integer().min(1).optional(),
        workouts: Joi.array().items(workoutSchema).min(1).optional().messages({
            'array.min': 'At least one workout is required if updating workouts',
        }),
    }).min(1).messages({
        'object.min': 'At least one field must be provided for update',
    }),
};

const deleteWorkoutPlan = {
    params: Joi.object().keys({
        planId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Plan ID is required',
            'any.invalid': 'Plan ID must be a valid MongoDB ObjectId',
        }),
    }),
};

export { createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan };
