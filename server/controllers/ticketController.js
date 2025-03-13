// server/controllers/ticketController.js
const { getMappedOrdersCached } = require('../routes/trimble'); // Using the caching function from your Trimble route

// (Optional) Legacy createTicket endpoint – may not be used when live data is in effect.
exports.createTicket = async (req, res) => {
  try {
    // This endpoint is legacy; live data is managed externally.
    return res.status(501).json({ success: false, error: "Ticket creation is not supported for live data." });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// For Admins/Agents: Get all live Trimble orders
exports.getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({ success: false, error: "Not authorized to view all tickets" });
    }
    const orders = await getMappedOrdersCached(req.query);
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Company Users: Get live Trimble orders for the user's company
exports.getCompanyTickets = async (req, res) => {
  try {
    if (!req.user || !req.user.company) {
      return res.status(400).json({ success: false, error: "User is not assigned to a company" });
    }
    const orders = await getMappedOrdersCached(req.query);
    const userCompanyId = req.user.company.toString();
    // Filter orders so that only those with a matching company ObjectId (as a string) are returned
    const companyOrders = orders.filter(order => order.company && order.company === userCompanyId);
    res.status(200).json({ success: true, data: companyOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// For Drivers: Get only their own live orders (if applicable)
// Note: If live Trimble orders don't include driver assignments, this may return an empty array.
exports.getMyTickets = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ success: false, error: "User not authenticated properly" });
    }
    const orders = await getMappedOrdersCached(req.query);
    const myOrders = orders.filter(order => order.user && order.user.toString() === req.user._id.toString());
    res.status(200).json({ success: true, data: myOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single live order by OrderID with related orders (repOrders) and role-based access control.
exports.getTicketById = async (req, res) => {
  try {
    const orderIdParam = req.params.id; // expecting the OrderID from Trimble
    const orders = await getMappedOrdersCached();
    const ticket = orders.find(o => o.orderId === orderIdParam);
    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    // Role-based access control:
    if (req.user.role === "admin" || req.user.role === "agent") {
      // Allowed to view all orders
    } else if (req.user.role === "driver") {
      if (!ticket.user || ticket.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Not authorized to view this ticket" });
      }
    } else if (req.user.role === "company_user") {
      if (!req.user.company || !ticket.company || ticket.company !== req.user.company.toString()) {
        return res.status(403).json({ success: false, error: "Not authorized to view this ticket" });
      }
    } else {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    // Find related orders based on matching roadCallId (excluding the main order)
    let relatedOrders = [];
    if (ticket.roadCallId) {
      relatedOrders = orders.filter(o => o.roadCallId === ticket.roadCallId && o.orderId !== ticket.orderId);
    }
    ticket.repOrders = relatedOrders;
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Disable updateTicket for live data
exports.updateTicket = async (req, res) => {
  res.status(501).json({ success: false, error: "Update operation is not supported on live data" });
};

// Disable deleteTicket for live data
exports.deleteTicket = async (req, res) => {
  res.status(501).json({ success: false, error: "Delete operation is not supported on live data" });
};
