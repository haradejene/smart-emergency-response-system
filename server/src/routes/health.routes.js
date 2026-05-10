const express = require("express");
const { Prisma } = require("@prisma/client");
const { prisma } = require("../services/incident.service");
const { getSocketStatus } = require("../websocket/socket");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * GET /api/health
 *
 * Returns server uptime and database connectivity status.
 * 200 — everything healthy
 * 503 — database unreachable
 */
router.get("/health", async (_req, res) => {
  let dbStatus = "connected";
  let httpStatus = 200;

  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
  } catch (error) {
    logger.error("Health-check: database unreachable", { error: error.message });
    dbStatus = "disconnected";
    httpStatus = 503;
  }

  const wsStatus = getSocketStatus();

  res.status(httpStatus).json({
    status: httpStatus === 200 ? "ok" : "degraded",
    uptime: process.uptime(),
    database: dbStatus,
    websocket: wsStatus,
  });
});

module.exports = router;
