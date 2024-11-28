const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "support"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const feedback = new mongoose.Schema({
  userid: {
    type: mongoose.mongo.ObjectId,
    required: false,
  },
  year: {
    type: Number,
    required: false,
  },
  month: {
    type: Number,
    required: false,
  },
  date: {
    type: Number,
    required: false,
  },
  hour: {
    type: Number,
    required: false,
  },
  minute: {
    type: Number,
    required: false,
  },
  feedback: {
    type: String,
    required: false,
  },
  messages: [messageSchema], // Array of messages
});

const FeedBacks = mongoose.model("feedback", feedback);

module.exports = FeedBacks;
