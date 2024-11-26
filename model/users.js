const mongoose = require("mongoose");

const Userdb = new mongoose.Schema({
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  membership: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  weight: {
    type: String,
    required: false,
  },
  weightUnit: {
    type: String,
    required: false,
  },
  height: {
    type: String,
    required: false,
  },
  heightUnit: {
    type: String,
    required: false,
  },
  fitnessGoal: {
    type: String,
    required: false,
  },
  loginState: {
    type: Boolean,
    required: false,
  },
  targetWeight: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
    enum: ["Male", "Female", "Other"], // Ensure valid values for gender
  },
  dob: {
    type: Date,
    required: false,
  },
  activityLevel: {
    type: String,
    required: false,
    enum: [
      "Sedentary",
      "Lightly active",
      "Moderately active",
      "Very active",
      "Super active",
    ], // Valid options
  },
  exerciseDays: {
    type: Number,
    required: false,
  },
  workoutDuration: {
    type: String,
    required: false,
  },
  dietaryPreferences: {
    type: [String],
    required: false,
  },
  calorieIntake: {
    type: Number,
    required: false,
  },
  medicalConditions: {
    type: String,
    required: false,
  },
  medication: {
    type: String,
    required: false,
    enum: ["yes", "no"], // Use enum to limit possible values
  },
  exerciseLimitations: {
    type: String,
    required: false,
    enum: ["yes", "no"], // Limit to yes/no
  },
  medicationDetail: {
    type: String,
    required: function () {
      return this.medication === "yes"; // Required if medication is yes
    },
  },
  conditionsDetail: {
    type: String,
    required: function () {
      return this.medicalConditions === "yes"; // Required if medicalConditions is yes
    },
  },
  exerciseLimitationsDetail: {
    type: String,
    required: function () {
      return this.exerciseLimitations === "yes"; // Required if exerciseLimitations is yes
    },
  },
  injury: {
    type: String,
    required: false,
    enum: ["yes", "no"], // Limit to yes/no
  },
  injuryDetail: {
    type: String,
    required: function () {
      return this.injury === "yes"; // Required if injury is yes
    },
  },
  agreeTerms: {
    type: Boolean,
    required: false,
  },
  receiveEmails: {
    type: Boolean,
    required: false,
  },
});

const fitnessuser = mongoose.model("Users", Userdb);
module.exports = fitnessuser;
