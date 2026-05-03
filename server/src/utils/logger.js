const { createLogger, format, transports } = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, errors, json } = format;

// Human-readable format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]${stack ? `: ${stack}` : `: ${message}`}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
  ),
  transports: [
    // Console — always active, colorized in development
    new transports.Console({
      format: combine(
        colorize(),
        consoleFormat,
      ),
    }),

    // File — always active, structured JSON for machine parsing
    new transports.File({
      filename: path.join(process.cwd(), "logs", "app.log"),
      format: combine(json()),
      maxsize: 5 * 1024 * 1024, // 5 MB per file
      maxFiles: 5,
    }),
  ],
  // Don't exit on uncaughtException — we handle that in server.js
  exitOnError: false,
});

module.exports = logger;
