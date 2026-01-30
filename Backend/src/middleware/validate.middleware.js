import Joi from 'joi';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';

/**
 * Validation Middleware
 * 
 * Validates request body, query params, and route params against Joi schemas
 */

/**
 * Validate MongoDB ObjectId
 */
const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.error('any.invalid');
    }
    return value;
};

/**
 * Middleware factory to validate requests
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
    const object = {};
    if (Object.prototype.hasOwnProperty.call(schema, 'body')) object.body = req.body;
    if (Object.prototype.hasOwnProperty.call(schema, 'query')) object.query = req.query;
    if (Object.prototype.hasOwnProperty.call(schema, 'params')) object.params = req.params;

    const { value, error } = Joi.compile(schema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details
            .map((details) => details.message)
            .join(', ');
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }

    if (value.body) Object.assign(req.body, value.body);
    if (value.query) Object.assign(req.query, value.query);
    if (value.params) Object.assign(req.params, value.params);
    return next();
};

export { validate, objectId };
