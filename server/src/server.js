require("dotenv").config();

const http = require("http");

const app = require("./app");
const logger = require("./utils/logger");
const { initializeSocket, closeSocket } = require("./websocket/socket");
const { disconnectPrisma } = require("./services/incident.service");

const port = Number(process.env.PORT) || 4000;
const server = http.createServer(app);

const rawOrigins = process.env.CORS_ORIGIN || "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

initializeSocket(server, {
  corsOrigin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
});

server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

// ── Graceful shutdown ───────────────────────────────────────────
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully…`);
  server.close(async () => {
    await closeSocket();
    await disconnectPrisma();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ── Crash-safety handlers ───────────────────────────────────────
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});
