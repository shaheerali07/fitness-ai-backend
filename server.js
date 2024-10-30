const express = require("./master/express");
const mongoose = require("./master/mongoose");
const config = require("./env/config");
const http = require("http");
const cors = require("cors");

const app = express();
// Configure CORS options
const corsOptions = {
  origin: "*", // Set this to specific domains if you want more control
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
mongoose();

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} at ${new Date()}`);
});

server.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
});

module.exports = app;
