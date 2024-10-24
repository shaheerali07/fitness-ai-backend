const router = require("express").Router();
const feedbackCtrl = require("../controller/feedback.controller");
var adminMiddleware = require("../middleware/auth.middleware");

router.post(
  "/setfeedback",
  adminMiddleware.authenticateJWT,

  feedbackCtrl.setFeedback
);

module.exports = router;
