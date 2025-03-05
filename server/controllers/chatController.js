// server/controllers/chatController.js
const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const chatData = req.body;
    // Automatically assign the sender from the authenticated user
    chatData.sender = req.user._id;
    
    // Retrieve the ticket to get its associated company
    const ticket = await Ticket.findById(chatData.ticket);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    // Optionally, assign the company from the ticket if needed
    chatData.company = ticket.company;
    
    // Create the chat
    const chat = await Chat.create(chatData);
    // Populate the sender's name field in the response
    await chat.populate('sender', 'name');
    
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// Get all chat messages for a given ticket with role-based access control
exports.getChatsByTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Role-based access for chats:
    if (req.user.role === 'admin' || req.user.role === 'agent') {
      // Admins/Agents can view chats for any ticket
    } else if (req.user.role === 'driver') {
      if (ticket.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Not authorized to view chats for this ticket' });
      }
    } else if (req.user.role === 'company_user') {
      if (!req.user.company || ticket.company.toString() !== req.user.company.toString()) {
        return res.status(403).json({ success: false, error: 'Not authorized to view chats for this ticket' });
      }
    } else {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const chats = await Chat.find({ ticket: ticketId })
  .populate('sender', 'name');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Admins/Agents: Get all chat messages
exports.getAllChats = async (req, res) => {
  try {
    // Only allow access if the user is an admin or agent.
    if (req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({ success: false, error: 'Not authorized to view all chats' });
    }
    const chats = await Chat.find()
      .populate('ticket', 'ticketNumber')
      .populate('sender', 'name');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Drivers: Get chat messages for all tickets that belong to the driver
exports.getMyChats = async (req, res) => {
  try {
    // First, find all tickets owned by this driver
    const tickets = await Ticket.find({ user: req.user._id });
    const ticketIds = tickets.map(ticket => ticket._id);
    // Then, find chats for those tickets
    const chats = await Chat.find({ ticket: { $in: ticketIds } })
      .populate('ticket', 'ticketNumber')
      .populate('sender', 'name');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Company Users: Get chat messages for all tickets associated with their company
exports.getCompanyChats = async (req, res) => {
  try {
    // First, find all tickets for the company
    const tickets = await Ticket.find({ company: req.user.company });
    const ticketIds = tickets.map(ticket => ticket._id);
    // Then, find chats for those tickets
    const chats = await Chat.find({ ticket: { $in: ticketIds } })
      .populate('ticket', 'ticketNumber')
      .populate('sender', 'name');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
