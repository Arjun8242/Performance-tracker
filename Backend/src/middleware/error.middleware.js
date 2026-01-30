import httpStatus from "http-status";
import config from "../config/env.js";
import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      error = new ApiError(httpStatus.BAD_REQUEST, message, false);
    }
    // Handle Mongoose duplicate key errors
    else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = `${field} already exists`;
      error = new ApiError(httpStatus.CONFLICT, message, false);
    }
    // Handle Mongoose cast errors (invalid ObjectId)
    else if (error.name === 'CastError') {
      const message = `Invalid ${error.path}: ${error.value}`;
      error = new ApiError(httpStatus.BAD_REQUEST, message, false);
    }
    // Generic error
    else {
      const statusCode =
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.message || httpStatus[statusCode];

      error = new ApiError(statusCode, message, false);
    }
  }

  next(error); // ALWAYS pass forward
};

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || httpStatus[statusCode];

  res.locals.errorMessage = message;

  logger.error(err);

  const response = {
    success: false,
    message,
    // Only include stack trace in development mode
    ...(config.env === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not Found"));
};

export { notFound, errorConverter, globalErrorHandler };
