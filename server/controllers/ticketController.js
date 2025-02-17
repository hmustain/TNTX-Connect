// server/controllers/ticketController.js
const Ticket = require('../models/Ticket');

exports.createTicket = async (req, res) => {
  try {
    // Assume the authenticated user is attached to req.user
    // (We'll add middleware for authentication later.)
    const ticketData = req.body;

    // Auto-generate a ticket number:
    // Find the ticket with the highest ticketNumber (assuming ticketNumber is stored as a string, e.g., "00001")
    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
    const lastTicketNumber = lastTicket ? parseInt(lastTicket.ticketNumber, 10) : 0;
    // Increment and pad to 5 digits (e.g., "00001")
    const newTicketNumber = (lastTicketNumber + 1).toString().padStart(5, '0');
    ticketData.ticketNumber = newTicketNumber;

    const ticket = await Ticket.create(ticketData);
    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all tickets
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get tickets by authenticated user only
exports.getMyTickets = async (req, res) => {
  try {
    // Assuming req.user is populated by the protect middleware
    const tickets = await Ticket.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a ticket by ID
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a ticket by ID
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
