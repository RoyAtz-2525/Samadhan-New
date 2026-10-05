require("dotenv").config();

var http = require("http");
var app = require("./app");

var PORT = process.env.PORT || 5000;

var server = http.createServer(app);

server.listen(PORT, function () {
  console.log("SAMADHAN API running on port " + PORT);
});
