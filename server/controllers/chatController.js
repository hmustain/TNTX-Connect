// server/controllers/chatController.js
const Chat = require('../models/Chat');

// Create a new chat message
exports.createChat = async (req, res) => {
  try {
    const chatData = req.body;
    const chat = await Chat.create(chatData);
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all chat messages for a given ticket
exports.getChatsByTicket = async (req, res) => {
  try {
    const chats = await Chat.find({ ticket: req.params.ticketId });
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
