const router = require("express").Router();
var adminMiddleware = require("../middleware/auth.middleware");
var chatbotController = require("../controller/chatbot.controller");

router.get("/askMe", adminMiddleware.authenticateJWT, chatbotController.askMe);

module.exports = router;
