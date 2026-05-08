const { Server } = require("socket.io");
const logger = require("../utils/logger");

let io = null;

function initializeSocket(httpServer, options = {}) {
  io = new Server(httpServer, {
    // CORS configuration - support both string origin and callback function
    cors: typeof options.corsOrigin === "function"
      ? { origin: options.corsOrigin, methods: ["GET", "POST"], credentials: true }
      : { origin: options.corsOrigin || "*", methods: ["GET", "POST"], credentials: true },
    // Render.com requires both transports
    transports: ["websocket", "polling"],
    // Enable compatibility with Socket.IO v3/v4 clients
    allowEIO3: true,
    // Allow upgrades from polling to websocket
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id} from ${socket.handshake.address}`);
    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });
    socket.on("error", (error) => {
      logger.error(`Socket error: ${socket.id}`, { error: error.message });
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
