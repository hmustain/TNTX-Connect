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

// Get all tickets this is role based ie: drivers can only see their tickets, agents/admin can see all, company_user can only see tickets for their company
exports.getTickets = async (req, res) => {
  try {
    let tickets;

    if (req.user.role === 'admin' || req.user.role === 'agent') {
      // Admins and agents can see all tickets
      tickets = await Ticket.find();
    } else if (req.user.role === 'company_user') {
      // Company users should only see tickets for their company
      tickets = await Ticket.find({ company: req.user.company });
    } else {
      // Drivers should only see their own tickets
      tickets = await Ticket.find({ user: req.user._id });
    }
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get tickets by authenticated user only (for drivers)
exports.getMyTickets = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ success: false, error: 'User not authenticated properly' });
    }
    // Convert req.user._id to string for comparison if needed
    const tickets = await Ticket.find({ user: req.user._id.toString() });
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
