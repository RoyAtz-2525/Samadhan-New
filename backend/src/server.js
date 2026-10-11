require("dotenv").config();

var http = require("http");
var app = require("./app");
var { connectDB } = require("./config/db");
var { connectRedis, closeRedis } = require("./config/redis");
var { initSocket } = require("./sockets");
var { startBackgroundWorkers, stopBackgroundWorkers } = require("./workers/worker");

var PORT = process.env.PORT || 5000;

var server = http.createServer(app);

// Initialize Socket.io with the HTTP server
initSocket(server);

server.listen(PORT, async function () {
  console.log("SAMADHAN API running on port " + PORT);
  try {
    await connectDB();
  } catch (err) {
    console.error("Critical database startup error:", err.message);
  }
  await connectRedis();

  // Initialize BullMQ background workers and SLA reconciliation within the same process
  try {
    const workerStatus = await startBackgroundWorkers();
    console.log("[Server] Background worker subsystem initialized:", workerStatus);
  } catch (err) {
    console.error("[Server] Background worker initialization error:", err.message);
  }
});

// Graceful shutdown handling
let isShuttingDown = false;
async function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("[Server] HTTP server closed.");
    try {
      await stopBackgroundWorkers(signal);
      await closeRedis();
      console.log("[Server] Shutdown complete.");
      process.exit(0);
    } catch (err) {
      console.error("[Server] Error during shutdown:", err.message);
      process.exit(1);
    }
  });

  // Safety fallback: force exit after 10s if connections fail to close
  setTimeout(() => {
    console.error("[Server] Forcefully shutting down after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
