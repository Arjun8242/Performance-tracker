class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true, code) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
