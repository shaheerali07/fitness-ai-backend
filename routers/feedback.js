const router = require("express").Router();
const feedbackCtrl = require("../controller/feedback.controller");
var adminMiddleware = require("../middleware/auth.middleware");

router.post(
  "/asksupport",
  adminMiddleware.authenticateJWT,

  feedbackCtrl.askSupport
);

router.get(
  "/getfeedback",
  adminMiddleware.authenticateJWT,

  feedbackCtrl.getFeedback
);

module.exports = router;
