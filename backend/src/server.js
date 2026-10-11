require("dotenv").config();

var http = require("http");
var app = require("./app");
var { connectDB } = require("./config/db");
var { connectRedis } = require("./config/redis");
var { initSocket } = require("./sockets");

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
});
