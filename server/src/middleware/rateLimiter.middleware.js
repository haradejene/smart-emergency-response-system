const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for the sensor-data ingestion endpoint.
 *
 * Defaults: 100 requests per 60 s per IP.
 * Both values are overridable via environment variables.
 */
const sensorDataLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,  // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers

  message: {
    message: "Too many requests. Please try again later.",
  },
});

module.exports = {
  sensorDataLimiter,
};
