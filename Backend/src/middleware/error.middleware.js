import httpStatus from "http-status";
import config from "../config/env.js";
import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message =
      error.message || httpStatus[statusCode];

    error = new ApiError(statusCode, message, false);
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
    ...(config.env === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not Found"));
};

export { notFound, errorConverter, globalErrorHandler };
