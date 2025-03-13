// server/models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    // Changed from an ObjectId reference to a String for the road call id
    ticket: {
      type: String,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: [true, 'Please add a message']
    },
    media: [
      {
        type: String // URL/path to media file
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Chat', chatSchema);
