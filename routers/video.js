router = require("express").Router();

videoCtrl = require("../controller/video.controller");
var adminMiddleware = require("../middleware/auth.middleware");

router.get(
  "/video_load",
  adminMiddleware.authenticateJWT,
  videoCtrl.video_load
);

module.exports = router;
