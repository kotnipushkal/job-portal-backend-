// Lightweight custom error class so controllers can throw errors with an
// HTTP status code attached, and the central error handler can read it.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
