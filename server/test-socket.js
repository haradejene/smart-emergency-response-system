const { io } = require("socket.io-client");

const socket = io("http://127.0.0.1:4000", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log(`Connected to socket server: ${socket.id}`);
  console.log("Listening for emergency-alert events...");
});

socket.on("emergency-alert", (payload) => {
  console.log("Received emergency-alert:");
  console.log(JSON.stringify(payload, null, 2));
});

socket.on("disconnect", (reason) => {
  console.log(`Socket disconnected: ${reason}`);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});
