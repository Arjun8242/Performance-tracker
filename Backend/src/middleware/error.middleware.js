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

  next(error);
};

const globalErrorHandler = (err, req, res, next) => {
  const { statusCode, message, errorCode } = err;

  res.locals.errorMessage = message;

  logger.error(err); // always log

  const response = {
    success: false,
    message,
    ...(errorCode && { errorCode }),
    ...(config.env === "development" && { stack: err.stack }),
  };

  res.status(statusCode).send(response);
};

const notFound = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not Found"));
};

export { notFound, errorConverter, globalErrorHandler };
