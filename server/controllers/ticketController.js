// server/controllers/ticketController.js
const Ticket = require('../models/Ticket');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    // Ensure that the ticket is associated with the authenticated user
    const ticketData = { ...req.body, user: req.user._id };

    // Auto-generate a ticket number:
    // Find the ticket with the most recent creation date
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

// For Admins/Agents: Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    // No filtering based on user; return all tickets.
    const tickets = await Ticket.find();
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Company Users: Get tickets for the company associated with the user
exports.getCompanyTickets = async (req, res) => {
  try {
    // Check if the user is associated with a company
    if (!req.user || !req.user.company) {
      return res.status(400).json({ success: false, error: 'User is not assigned to a company' });
    }
    // Find tickets that match the user's company
    const tickets = await Ticket.find({ company: req.user.company });
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Drivers: Get only their own tickets
exports.getMyTickets = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ success: false, error: 'User not authenticated properly' });
    }
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
