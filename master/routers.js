const fs = require("fs");
let routers = [];

(() => {
  try {
    const files = fs.readdirSync("routers");
    routers = files
      .filter((file) => file.endsWith(".js"))
      .map((file) => file.split(".").slice(0, -1).join("."));
  } catch (error) {
    console.error("Error reading routers directory:", error);
    routers = [];
  }
})();

module.exports = routers;
