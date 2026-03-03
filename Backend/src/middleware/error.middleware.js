import httpStatus from "http-status";
import config from "../config/env.js";
import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      const message = "Configuration or validation failed";
      error = new ApiError(httpStatus.BAD_REQUEST, message, errors, false, 'VALIDATION_ERROR');
    }
    // Handle Mongoose duplicate key errors
    else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const message = `${field} already exists`;
      error = new ApiError(httpStatus.CONFLICT, message, [], false, 'DUPLICATE_KEY');
    }
    // Handle Mongoose cast errors (invalid ObjectId)
    else if (error.name === 'CastError') {
      const message = `Invalid ${error.path}: ${error.value}`;
      error = new ApiError(httpStatus.BAD_REQUEST, message, [], false, 'INVALID_ID');
    }
    // Generic error
    else {
      const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || httpStatus[statusCode];

      error = new ApiError(statusCode, message, [], false);
    }
  }

  next(error); // ALWAYS pass forward
};

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || httpStatus[statusCode];

  res.locals.errorMessage = message;

  logger.error(err.message || 'Unknown error', { stack: err.stack, statusCode });

  const errorCode = err.code || (httpStatus[statusCode] || 'INTERNAL_SERVER_ERROR').toString().toUpperCase().replace(/\s+/g, '_');

  const response = {
    success: false,
    message,
    errorCode,
    ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
    ...(config.env === "development" && { stack: err.stack, statusCode }),
  };

  res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not Found", [], true, 'NOT_FOUND'));
};

export { notFound, errorConverter, globalErrorHandler };
