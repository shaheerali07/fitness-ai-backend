const router = require("express").Router();

var adminCtrl = require("../controller/admin.controller");
var adminMiddleware = require("../middleware/auth.middleware");

router.get("/test", adminCtrl.test);
router.post("/signup", adminCtrl.signup);
router.post(
  "/signupUpdate",
  adminMiddleware.authenticateJWT,
  adminCtrl.signupUpdate
);
router.get("/signin", adminCtrl.signin);
router.post("/forgotPassword", adminCtrl.forgotPassword);
router.post("/resetPassword", adminCtrl.resetPassword);
router.get(
  "/getUserByEmail",
  adminMiddleware.authenticateJWT,
  adminCtrl.getUserByEmail
);
router.post(
  "/changePassword",
  adminMiddleware.authenticateJWT,
  adminCtrl.changePassword
);

module.exports = router;
