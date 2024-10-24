const router = require("express").Router();
const exerciseCtrl = require("../controller/exercise.controller");
var adminMiddleware = require("../middleware/auth.middleware");

router.post(
  "/setlogs",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.setExerciseLogs
);
router.post(
  "/setexercise",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.setExercisePlan
);
router.get(
  "/getexercise",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.getExercisePlan
);
router.get(
  "/getweeklyhistory",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.getWeeklyExerciseHistory
);

module.exports = router;
