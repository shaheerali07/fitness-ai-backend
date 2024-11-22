const { EXERCISES } = require("../static/data");
const moment = require("moment"); // Moment.js is used to handle date manipulation.

exports.setExerciseLogs = async (req, res) => {
  console.log("exercise is up to day");

  const logs = require("../model/logs");
  const user = require("../model/users");
  const newData = req.body;
  const header = newData.header;
  const updateData = newData.updateData;

  console.log(updateData);
  const { email, password } = header;

  let state = true;

  user.findOne({ email, password }).then((result) => {
    const newlog = new logs({
      ...updateData,
      userid: result._id,
    });

    newlog.save().then(() => {
      res.send({
        message: "success",
      });
    });
  });
};
function findExerciseKind(exerciseName) {
  for (const kind of EXERCISES.kinds) {
    if (Array.isArray(kind.exercises)) {
      if (kind.exercises.includes(exerciseName)) {
        return { index: kind.index, category: kind.category };
      }
    } else {
      for (const category in kind.exercises) {
        if (kind.exercises[category].includes(exerciseName)) {
          return { index: kind.index, category: kind.category };
        }
      }
    }
  }
  return null; // Exercise not found
}
exports.updateExercisePlan = async (req, res) => {
  const exerciseModel = require("../model/exercise");
  const logsModel = require("../model/logs");
  const userModel = require("../model/users");
  const {
    _id,
    exerciseStatusIndex,
    hours,
    minutes,
    seconds,
    counter,
    email,
    password,
  } = req.body;

  try {
    // Find the exercise document by ID
    const exerciseEntry = await exerciseModel.findById(_id);

    if (!exerciseEntry) {
      return res.status(404).send({ message: "Exercise entry not found." });
    }

    // Ensure the exerciseStatusIndex is within bounds
    if (
      exerciseStatusIndex >= exerciseEntry.exerciseType.exerciseStatus.length
    ) {
      return res
        .status(400)
        .send({ message: "Invalid exercise plan provided." });
    }

    const exerciseName =
      exerciseEntry.exerciseType.exerciseName[exerciseStatusIndex];
    const exerciseKind = await findExerciseKind(exerciseName);

    if (!exerciseKind) {
      return res.status(400).send({ message: "Exercise kind not found." });
    }

    const logData = {
      year: exerciseEntry.year,
      month: exerciseEntry.month,
      date: exerciseEntry.date,
      day: exerciseEntry.day,
      hour: hours,
      minute: minutes,
      second: seconds,
      durtime: hours,
      accuracy: null,
      counter: counter,
      index: exerciseKind.index,
      category: exerciseKind.category,
      exercise: exerciseName,
    };

    // Update the status at the specified index
    exerciseEntry.exerciseType.exerciseStatus[exerciseStatusIndex] = "complete";
    await exerciseEntry.save();

    const user = await userModel.findOne({ email, password });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const newLog = new logsModel({ ...logData, userid: user._id });
    await newLog.save();

    res.status(200).send({ message: "Exercise status updated successfully." });
  } catch (error) {
    console.error("Error updating exercise plan:", error);
    res
      .status(500)
      .send({ message: "An error occurred while updating the exercise plan." });
  }
};
exports.setExercisePlan = (req, res) => {
  const user = require("../model/users");
  const exercise = require("../model/exercise");
  const newData = req.body;

  const header = newData.header;
  const { email, password } = header;
  const updateData = newData.updateData;

  if (updateData.year === "") return;

  user
    .findOne({ email: email, password: password })
    .then(async (result) => {
      if (result === null) {
        res.send({
          message: "User is not registered.",
        });
        return;
      }

      // Check if an exercise entry already exists for the specified date
      const existingExercise = await exercise.findOne({
        userid: result._id,
        year: updateData.year,
        month: updateData.month,
        date: updateData.date,
      });

      if (existingExercise) {
        // Update the existing exercise entry with new data
        existingExercise.exerciseType = updateData.exerciseType;
        await existingExercise.save();
        res.send({
          message: "Exercise data updated for the existing date.",
        });
      } else {
        // Create a new exercise entry if no existing entry is found
        const newExercise = new exercise({
          userid: result._id,
          year: updateData.year,
          month: updateData.month,
          date: updateData.date,
          day: updateData.day,
          exerciseType: updateData.exerciseType,
        });
        await newExercise.save();
        res.send({
          message: "Exercise data added for the new date.",
        });
      }
    })
    .catch((error) => {
      console.error("Error processing request:", error);
      res.status(500).send({
        message: "An error occurred while processing the request.",
      });
    });
};

exports.getExercisePlan = async (req, res) => {
  const header = req.query.header;
  const getData = req.query.getData;

  const exercise = require("../model/exercise");
  const user = require("../model/users");
  if (getData.year === "") {
    return;
  }
  let userid = "";
  await user
    .findOne({ email: header.email })
    .then(async (result) => {
      if (result) {
        userid = result._id;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  if (userid === "")
    res.send({
      message: "ExercisePlan is not exist",
    });
  else {
    await exercise
      .find({
        userid: userid,
        year: getData.year,
        month: getData.month,
        date: getData.date,
      })
      .then((result) => {
        if (result.length !== 0) {
          res.send({
            message: "success",
            result: result[0],
          });
        } else {
          res.send({
            message: "There is no plan",
          });
        }
      });
  }
};

exports.getWeeklyExerciseHistory = async (req, res) => {
  const user = require("../model/users");
  const logs = require("../model/logs");

  const header = req.query.header;
  const updateData = req.query.updateData;
  const { email, password } = header;
  const year = updateData.year;
  const month = updateData.month;
  const date = updateData.date;

  const userlist = await user.findOne({ email: email, password: password });

  const result = await logs.aggregate([
    {
      $match: {
        userid: userlist._id,
        $expr: {
          $and: [
            { $gte: [{ $toInt: "$year" }, year[0]] },
            { $lte: [{ $toInt: "$year" }, year[6]] },
            { $gte: [{ $toInt: "$month" }, month[0]] },
            { $lte: [{ $toInt: "$month" }, month[6]] },
            { $gte: [{ $toInt: "$date" }, date[0]] },
            { $lte: [{ $toInt: "$date" }, date[6]] },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
          date: "$date",
        },
        averageCounter: { $avg: { $toInt: "$counter" } },
        averageDurtime: { $sum: { $toInt: "$durtime" } },
        averageAccuracy: { $avg: { $toDouble: "$accuracy" } },
        data: { $push: "$$ROOT" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1, "_id.date": -1 } },
  ]);

  res.send(result);
};

exports.getCompletedExercisePercentage = async (req, res) => {
  const ExerciseModel = require("../model/exercise");

  try {
    const { startDate, endDate } = req.query;

    // Parse the provided startDate and endDate from req.params to moment objects
    const startOfWeek = moment(startDate, "YYYY-MM-DD").startOf("day");
    const endOfWeek = moment(endDate, "YYYY-MM-DD").endOf("day");

    // Query the exerciseType collection to find exercises within the provided date range
    const exercises = await ExerciseModel.find({
      year: { $gte: startOfWeek.year(), $lte: endOfWeek.year() },
      month: { $gte: startOfWeek.month() + 1, $lte: endOfWeek.month() + 1 },
      date: { $gte: startOfWeek.date(), $lte: endOfWeek.date() },
    });

    // If no exercises found, return a message
    if (!exercises.length) {
      return res
        .status(404)
        .json({ message: "No exercises found for the given date range." });
    }

    // Calculate the completed percentage for each exerciseType
    let totalCompleted = 0;
    let totalExercises = 0;

    exercises.forEach((exercise) => {
      const exerciseStatus = exercise.exerciseType.exerciseStatus;
      const completedCount = exerciseStatus.filter(
        (status) => status === "complete"
      ).length;
      const totalCount = exerciseStatus.length;

      // Calculate the percentage of completed exercises for this exerciseType
      const completedPercentage = (completedCount / totalCount) * 100;

      // Add the exercise completion to the total calculation
      totalCompleted += completedCount;
      totalExercises += totalCount;
    });

    // Calculate the overall percentage of completed exercises for the current week
    const overallCompletionPercentage = (totalCompleted / totalExercises) * 100;

    // Return the overall completion percentage
    return res.status(200).json({
      overallCompletionPercentage: overallCompletionPercentage.toFixed(2),
      totalCompletedExercises: totalCompleted,
      totalExercises: totalExercises,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the data." });
  }
};
exports.getTotalExerciseTime = async (req, res) => {
  const LogExerciseModel = require("../model/logs");

  try {
    const { startDate, endDate } = req.query;

    // Parse the provided startDate and endDate from req.params to moment objects
    const startOfWeek = moment(startDate, "YYYY-MM-DD").startOf("day");
    const endOfWeek = moment(endDate, "YYYY-MM-DD").endOf("day");

    // Query the logexercise collection to find exercises within the provided date range
    const logExercises = await LogExerciseModel.find({
      year: { $gte: startOfWeek.year(), $lte: endOfWeek.year() },
      month: { $gte: startOfWeek.month() + 1, $lte: endOfWeek.month() + 1 },
      date: { $gte: startOfWeek.date(), $lte: endOfWeek.date() },
    });

    // If no log exercises found, return a message
    if (!logExercises.length) {
      return res
        .status(404)
        .json({ message: "No log exercises found for the given date range." });
    }

    // Calculate the total duration time (in minutes) for all exercises found in the range
    let totalDuration = 0;

    logExercises.forEach((logExercise) => {
      // Convert the durtime from string to number (assuming it is in minutes)
      totalDuration += parseInt(logExercise.hour, 10);
    });

    // Convert total duration to hours and minutes
    // const totalHours = Math.floor(totalDuration / 60);
    // const totalMinutes = totalDuration % 60;

    // Return the total time in hours and minutes
    return res.status(200).json({
      totalDuration: totalDuration,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the data." });
  }
};

exports.getWeeklyExerciseStats = async (req, res) => {
  const LogExerciseModel = require("../model/logs");

  try {
    const { startDate, endDate } = req.query;

    // Parse the provided startDate and endDate from req.query to moment objects
    const startOfWeek = moment(startDate, "YYYY-MM-DD").startOf("day");
    const endOfWeek = moment(endDate, "YYYY-MM-DD").endOf("day");

    // Retrieve records that match the date range criteria
    const logExercises = await LogExerciseModel.find({
      $or: [
        {
          year: startOfWeek.year(),
          month: startOfWeek.month() + 1,
          date: { $gte: startOfWeek.date() },
        },
        {
          year: endOfWeek.year(),
          month: endOfWeek.month() + 1,
          date: { $lte: endOfWeek.date() },
        },
        {
          year: startOfWeek.year(),
          month: { $gt: startOfWeek.month() + 1 },
        },
        {
          year: endOfWeek.year(),
          month: { $lt: endOfWeek.month() + 1 },
        },
        {
          year: { $gt: startOfWeek.year(), $lt: endOfWeek.year() },
        },
      ],
    });

    // console.log("Log Exercises:", logExercises);

    // Group exercises by date and calculate totals for accuracy, counter, and duration
    const dailyStats = {};

    logExercises.forEach((exercise) => {
      const dateKey = `${exercise.year}-${exercise.month}-${exercise.date}`;
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          accuracySum: 0,
          accuracyCount: 0,
          counter: 0,
          duration: 0,
        };
      }

      // Calculate accuracy, handling null values
      if (exercise.accuracy != null) {
        dailyStats[dateKey].accuracySum += parseFloat(exercise.accuracy);
        dailyStats[dateKey].accuracyCount += 1;
      }

      // Sum counter and duration
      dailyStats[dateKey].counter += parseInt(exercise.counter || "0", 10);
      dailyStats[dateKey].duration += parseInt(exercise.hour || "0", 10);
    });

    // Format the result for each date within the range
    const allDaysInRange = [];
    let currentDate = moment(startDate);

    while (currentDate.isSameOrBefore(endOfWeek)) {
      const dateKey = currentDate.format("YYYY-M-D");
      const stats = dailyStats[dateKey] || {
        accuracySum: 0,
        accuracyCount: 0,
        counter: 0,
        duration: 0,
      };

      // Calculate average accuracy if there are entries for the day
      const averageAccuracy =
        stats.accuracyCount > 0
          ? (stats.accuracySum / stats.accuracyCount).toFixed(2)
          : 0;

      allDaysInRange.push({
        date: currentDate.format("YYYY-MM-DD"),
        accuracy: parseFloat(averageAccuracy),
        counter: stats.counter,
        duration: stats.duration,
      });

      currentDate.add(1, "day");
    }

    // Return the result
    return res.status(200).json({
      chartData: allDaysInRange,
    });
  } catch (error) {
    console.error("Error fetching weekly exercise stats:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the data." });
  }
};
exports.getTotals = async (req, res) => {
  const LogExerciseModel = require("../model/logs");

  const { startDate, endDate } = req.query;

  try {
    // Parse dates
    const startOfWeek = moment(startDate, "YYYY-MM-DD").startOf("day");
    const endOfWeek = moment(endDate, "YYYY-MM-DD").endOf("day");

    // Fetch all exercise logs for the user in the given date range
    const exercises = await LogExerciseModel.find({
      year: {
        $gte: startOfWeek.year(),
        $lte: endOfWeek.year(),
      },
      month: {
        $gte: startOfWeek.month() + 1,
        $lte: endOfWeek.month() + 1,
      },
      date: {
        $gte: startOfWeek.date(),
        $lte: endOfWeek.date(),
      },
    });

    // Initialize totals
    let totalCounter = 0;
    let totalDuration = 0;
    let totalAccuracySum = 0;
    let accuracyCount = 0;

    // Iterate over each exercise log and calculate totals
    exercises.forEach((exercise) => {
      totalCounter += parseInt(exercise.counter) || 0;
      // Assuming totalDuration is initially in hours
      totalDuration += parseInt(exercise.hour) || 0; // Convert hours to minutes and add to totalDuration

      // Only include accuracy if it exists and is not null
      if (exercise.accuracy !== null) {
        totalAccuracySum += parseFloat(exercise.accuracy);
        accuracyCount += 1;
      }
    });

    // Calculate the average accuracy
    const averageAccuracy =
      accuracyCount > 0 ? totalAccuracySum / accuracyCount : 0;

    // Send response
    res.json({
      totalCounter,
      totalDuration,
      averageAccuracy,
    });
  } catch (error) {
    console.error("Error fetching totals:", error);
    res.status(500).json({ error: "Failed to fetch totals" });
  }
};
