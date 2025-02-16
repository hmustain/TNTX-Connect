// server/routes/ticket.js
const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// Create a ticket
router.post('/', protect, createTicket);

// Get all tickets
router.get('/', protect, getTickets);

// Get single ticket by ID
router.get('/:id', protect, getTicketById);

// Update ticket by ID
router.put('/:id', protect, updateTicket);

// Delete ticket by ID
router.delete('/:id', protect, deleteTicket);

module.exports = router;
