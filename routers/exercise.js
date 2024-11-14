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

router.post(
  "/updateexercise",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.updateExercisePlan
);

router.get(
  "/getCompletedExercisePercentage",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.getCompletedExercisePercentage
);
router.get(
  "/getTotalExerciseTime",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.getTotalExerciseTime
);
router.get(
  "/getWeeklyExerciseStats",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.getWeeklyExerciseStats
);
router.get(
  "/getTotals",
  adminMiddleware.authenticateJWT,
  exerciseCtrl.getTotals
);

module.exports = router;
