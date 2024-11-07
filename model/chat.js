const mongoose = require('mongoose');

// Message schema to store individual messages from the user and AI
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }  // Prevents creating an ID for each individual message
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Assuming you have a User model to associate the chat with a user
      required: true
    },
    messages: [messageSchema],  // Array of messages (user and AI)
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true  // Automatically manages createdAt and updatedAt
  }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
