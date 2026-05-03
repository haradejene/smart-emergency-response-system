const logger = require("../utils/logger");

class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, "Route not found."));
}

/**
 * Global error-handling middleware.
 * - Logs 500-level errors with full stack traces via Winston.
 * - In production, sanitizes the response to avoid leaking internals.
 */
function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  // Log server errors (5xx) at error level with stack trace
  if (statusCode >= 500) {
    logger.error(err.message, {
      statusCode,
      stack: err.stack,
    });
  }

  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    message:
      statusCode >= 500 && isProduction
        ? "Internal server error."
        : err.message || "Internal server error.",
  };

  if (err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  HttpError,
  notFoundHandler,
  errorHandler,
};
