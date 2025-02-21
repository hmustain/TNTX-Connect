  // server/routes/ticket.js
  const express = require('express');
  const router = express.Router();
  const {
    createTicket,
    getTicketById,
    updateTicket,
    deleteTicket,
    getMyTickets,
    getAllTickets,
    getCompanyTickets
  } = require('../controllers/ticketController');
  const { protect } = require('../middleware/auth');

  // Use protect middleware to require authentication to all routes in this router
  router.use(protect);

  // Create a ticket
  router.post('/', createTicket);

  // Get all tickets (admin/agents)
  router.get('/', getAllTickets);

  // Get ticket by authenticated user (driver)
  router.get('/mytickets', getMyTickets);

  //Get tickets by associated with company (for company users)
  router.get('/company', getCompanyTickets);

  // Get single ticket by ID
  router.get('/:id', getTicketById);

  // Update ticket by ID
  router.put('/:id', updateTicket);

  // Delete ticket by ID
  router.delete('/:id', deleteTicket);

  module.exports = router;
