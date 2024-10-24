const express = require("./master/express");
const mongoose = require("./master/mongoose");
const config = require("./env/config");
const http = require("http");

const app = express();
mongoose();

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} at ${new Date()}`);
});

server.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
});
