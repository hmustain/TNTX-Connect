// server/controllers/chatController.js
const Chat = require('../models/Chat');

// Create a new chat message for a live ticket (using the road call id)
exports.createChat = async (req, res) => {
  try {
    const { ticket, message } = req.body; // 'ticket' is now the road call id (string)
    if (!ticket || !message) {
      return res.status(400).json({ success: false, error: "Ticket id and message are required." });
    }
    
    // Create the chat message with the sender from the authenticated user
    const chat = await Chat.create({
      ticket,
      sender: req.user._id,
      message
    });
    
    // Populate the sender's name for the response
    await chat.populate('sender', 'name');
    
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all chat messages for a given live ticket (using road call id)
// No local Ticket lookup is done since live tickets are external.
exports.getChatsByTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId; // This should be the road call id (e.g., "RC27171")
    const chats = await Chat.find({ ticket: ticketId }).populate('sender', 'name');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Admins/Agents: Get all chat messages (read-only)
exports.getAllChats = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({ success: false, error: 'Not authorized to view all chats' });
    }
    const chats = await Chat.find().populate('sender', 'name');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Drivers: Get chat messages where the driver is the sender
exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ sender: req.user._id }).populate('sender', 'name');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Company Users: Since we can’t automatically tie a live road call id to a company without additional mapping,
// this endpoint is not supported. You may later implement additional logic if needed.
exports.getCompanyChats = async (req, res) => {
  res.status(501).json({ success: false, error: "This endpoint is not supported for live data." });
};
