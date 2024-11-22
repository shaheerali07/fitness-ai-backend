const router = require("express").Router();
const dietCtrl = require("../controller/diet.controller");
var adminMiddleware = require("../middleware/auth.middleware");

router.post("/setdiet", adminMiddleware.authenticateJWT, dietCtrl.setDietPlan);
router.post(
  "/setdietmenu",
  adminMiddleware.authenticateJWT,
  dietCtrl.setDietMenu
);
router.post(
  "/seeddietmenu",
  adminMiddleware.authenticateJWT,
  dietCtrl.seeddietmenu
);
router.post(
  "/settargetkcal",
  adminMiddleware.authenticateJWT,
  dietCtrl.setTargetKcal
);
router.get("/getdiet", adminMiddleware.authenticateJWT, dietCtrl.getDietPlan);
router.get(
  "/getdietmenu",
  adminMiddleware.authenticateJWT,
  dietCtrl.getDietMenu
);
router.get(
  "/getweeklytotaldata",
  adminMiddleware.authenticateJWT,
  dietCtrl.getWeeklyTotalData
);
router.get(
  "/gettargetkcal",
  adminMiddleware.authenticateJWT,
  dietCtrl.getTargetKcal
);

router.get(
  "/getWeeklyTotalStats",
  adminMiddleware.authenticateJWT,
  dietCtrl.getWeeklyTotalStats
);

router.post("/updateDietStatus", dietCtrl.updateDietStatus);

module.exports = router;
