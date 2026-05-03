const { Server } = require("socket.io");
const logger = require("../utils/logger");

let io = null;

function initializeSocket(httpServer, options = {}) {
  io = new Server(httpServer, {
    cors: {
      origin: options.corsOrigin || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function emitEmergencyAlert(payload) {
  if (!io) {
    logger.warn("Socket.IO not initialized — alert not emitted");
    return;
  }
  io.emit("emergency-alert", payload);
}

async function closeSocket() {
  if (!io) return;
  await io.close();
  io = null;
  logger.info("Socket.IO server closed");
}

module.exports = {
  initializeSocket,
  emitEmergencyAlert,
  closeSocket,
};
