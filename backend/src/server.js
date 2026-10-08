require("dotenv").config();

var http = require("http");
var app = require("./app");
var { connectDB } = require("./config/db");

var PORT = process.env.PORT || 5000;

var server = http.createServer(app);

server.listen(PORT, async function () {
  console.log("SAMADHAN API running on port " + PORT);
  await connectDB();
});

