// server/models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true
    },
    // The sender of the message: could be a user or agent.
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
        type: String // URL or path to the media file
      }
    ]
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Chat', chatSchema);
