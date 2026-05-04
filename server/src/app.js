const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

const logger = require("./utils/logger");
const sensorRoutes = require("./routes/sensor.routes");
const healthRoutes = require("./routes/health.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Pretty-print JSON responses
app.set("json spaces", 2);

// ── Security ────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — explicit allowlist from CORS_ORIGIN env var ──────────
const rawOrigins = process.env.CORS_ORIGIN || "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// ── Body parsing ────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ── HTTP request logging via Morgan → Winston ───────────────────
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: morganStream,
  }),
);

// ── Swagger Documentation ───────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Smart Emergency Response System API",
}));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api", healthRoutes);
app.use("/api", sensorRoutes);

// Provide a root response so requests to `/` (or HEAD /) don't return 404.
// Render and some uptime checks may probe the root URL — redirect GET
// requests to the health endpoint and answer HEAD requests with 200.
app.head("/", (_req, res) => res.status(200).end());
app.get("/", (_req, res) => res.redirect("/api/health"));

// ── Error handling ──────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
