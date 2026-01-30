import Joi from 'joi';
import { objectId } from '../middleware/validate.middleware.js';

/**
 * Workout Log Validation Schemas
 */

const performedExerciseSchema = Joi.object().keys({
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
    weight: Joi.number().min(0).required().messages({
        'any.required': 'Weight is required',
        'number.min': 'Weight cannot be negative',
    }),
});

const logWorkout = {
    body: Joi.object().keys({
        workoutId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Workout ID is required',
            'any.invalid': 'Workout ID must be a valid MongoDB ObjectId',
        }),
        date: Joi.date().iso().required().messages({
            'any.required': 'Date is required',
            'date.format': 'Date must be a valid ISO date string',
        }),
        status: Joi.string().valid('completed', 'skipped').required().messages({
            'any.required': 'Status is required',
            'any.only': 'Status must be either "completed" or "skipped"',
        }),
        performedExercises: Joi.array().items(performedExerciseSchema).when('status', {
            is: 'completed',
            then: Joi.array().min(1).messages({
                'array.min': 'At least one performed exercise is required when status is "completed"',
            }),
            otherwise: Joi.array().max(0).messages({
                'array.max': 'Performed exercises must be empty when status is "skipped"',
            }),
        }),
        notes: Joi.string().trim().optional().allow(''),
    }),
};

const getWorkoutLogs = {
    query: Joi.object().keys({
        from: Joi.date().iso().optional().messages({
            'date.format': 'From date must be a valid ISO date string',
        }),
        to: Joi.date().iso().optional().messages({
            'date.format': 'To date must be a valid ISO date string',
        }),
        page: Joi.number().integer().min(1).optional().default(1).messages({
            'number.min': 'Page must be at least 1',
        }),
        limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100',
        }),
    }),
};

export { logWorkout, getWorkoutLogs };
