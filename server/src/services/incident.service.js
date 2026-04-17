const { PrismaClient } = require("@prisma/client");
const { HttpError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

async function createIncident(data) {
  try {
    return await prisma.incident.create({ data });
  } catch (error) {
    logger.error("Failed to create incident in database", {
      error: error.message,
      stack: error.stack,
    });

    if (
      error &&
      (error.name === "PrismaClientInitializationError" ||
        error.name === "PrismaClientUnknownRequestError" ||
        error.name === "PrismaClientRustPanicError")
    ) {
      throw new HttpError(503, "Database unavailable. Check Neon connection.");
    }
    throw error;
  }
}

async function disconnectPrisma() {
  await prisma.$disconnect();
  logger.info("Prisma client disconnected");
}

module.exports = {
  prisma,
  createIncident,
  disconnectPrisma,
};
