const { Server } = require("socket.io");
const logger = require("../utils/logger");

let io = null;

function initializeSocket(httpServer, options = {}) {
  // Handle CORS - credentials can't be true with wildcard origin
  const corsConfig =
    typeof options.corsOrigin === "function"
      ? {
          origin: options.corsOrigin,
          methods: ["GET", "POST"],
          credentials: true,
        }
      : {
          origin: options.corsOrigin || "*",
          methods: ["GET", "POST"],
          credentials: false,
        };

  io = new Server(httpServer, {
    cors: corsConfig,
    // Render.com requires both transports (polling first, then upgrade to websocket)
    transports: ["polling", "websocket"],
    // Enable compatibility with Socket.IO v3/v4 clients
    allowEIO3: true,
    // Allow upgrades from polling to websocket
    pingTimeout: 60000,
    pingInterval: 25000,
    // Render uses a proxy - need to handle this
    allowUpgrades: true,
    upgradeTimeout: 10000,
  });

  logger.info("Socket.IO initialized with CORS:", {
    origin: corsConfig.origin,
    transports: ["polling", "websocket"],
  });

  // Track connection count
  let connectionCount = 0;

  io.on("connection", (socket) => {
    connectionCount++;
    logger.info(
      `Socket connected: ${socket.id} from ${socket.handshake.address} (total: ${connectionCount})`,
    );

    // Send welcome message to confirm connection works
    socket.emit("connected", {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    socket.on("disconnect", (reason) => {
      connectionCount--;
      logger.info(
        `Socket disconnected: ${socket.id}, reason: ${reason} (total: ${connectionCount})`,
      );
    });

    socket.on("error", (error) => {
      logger.error(`Socket error: ${socket.id}`, { error: error.message });
    });

    // Handle ping/pong for health checks and optional client acknowledgements
    socket.on("ping", (payload, callback) => {
      const pongPayload = {
        time: Date.now(),
        socketId: socket.id,
        payload: payload ?? null,
      };

      socket.emit("pong", pongPayload);

      if (typeof callback === "function") {
        callback(pongPayload);
      }
    });
  });

  // Log engine events for debugging
  io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", {
      req: err.req,
      code: err.code,
      message: err.message,
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

function getSocketStatus() {
  if (!io) {
    return { initialized: false, connections: 0 };
  }
  const sockets = io.sockets?.sockets;
  const connectionCount = sockets ? sockets.size : 0;
  return {
    initialized: true,
    connections: connectionCount,
    engine: io.engine ? "running" : "not running",
  };
}

module.exports = {
  initializeSocket,
  emitEmergencyAlert,
  closeSocket,
  getSocketStatus,
};
