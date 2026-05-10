const { io } = require("socket.io-client");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

console.log(`🔌 Testing WebSocket connection to: ${SERVER_URL}`);

const socket = io(SERVER_URL, {
  transports: ["polling", "websocket"], // Start with polling, upgrade to websocket
  reconnectionAttempts: 3,
  timeout: 10000,
  forceNew: true,
});

socket.on("connect", () => {
  console.log("✅ WebSocket CONNECTED successfully!");
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Transport: ${socket.io.engine.transport.name}`);

  // Listen for server welcome message
  socket.on("connected", (data) => {
    console.log("📨 Server welcome:", data);
  });

  // Listen for emergency alerts
  socket.on("emergency-alert", (data) => {
    console.log("🚨 Emergency Alert received:", data);
  });

  // Test ping/pong
  socket.emit("ping");
  socket.on("pong", (data) => {
    console.log("🏓 Pong received:", data);
  });

  // Keep connection open for 5 seconds then disconnect
  setTimeout(() => {
    console.log("🔌 Disconnecting...");
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on("connect_error", (error) => {
  console.error("❌ WebSocket connection ERROR:", error.message);
  console.error("   Trying polling transport...");
});

socket.on("disconnect", (reason) => {
  console.log(`🔌 Disconnected: ${reason}`);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error("❌ Connection timeout - could not connect to WebSocket");
  process.exit(1);
}, 10000);
