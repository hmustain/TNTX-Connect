// server/controllers/chatController.js
const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');

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

/// Get all chat messages for a given ticket with role-based access control
exports.getChatsByTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    // First, fetch the ticket to verify its ownership or company association
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Role-based access for chats:
    if (req.user.role === 'admin' || req.user.role === 'agent') {
      // Admins/Agents can view chats for any ticket
    } else if (req.user.role === 'driver') {
      // Drivers can view chats only if the ticket belongs to them
      if (ticket.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Not authorized to view chats for this ticket' });
      }
    } else if (req.user.role === 'company_user') {
      // Company users can view chats only if the ticket is associated with their company
      if (!req.user.company || ticket.company.toString() !== req.user.company.toString()) {
        return res.status(403).json({ success: false, error: 'Not authorized to view chats for this ticket' });
      }
    } else {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // If authorization passes, fetch the chats
    const chats = await Chat.find({ ticket: ticketId });
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

