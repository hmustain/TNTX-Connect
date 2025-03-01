// server/controllers/ticketController.js
const Ticket = require("../models/Ticket");

exports.createTicket = async (req, res) => {
  try {
    // Extract standard and breakdown-specific fields from req.body.
    const {
      // Breakdown fields (some will be ignored)
      firstName,
      lastName,
      phoneNumber,
      email,
      company, // Should be an ObjectId (or string convertible to one)
      unitAffected,
      complaint,
      tractorNumber,
      make, // Not stored in Ticket model (could be stored elsewhere)
      model, // Not stored in Ticket model (could be stored elsewhere)
      vinLast8,
      trailerNumber,
      loadStatus,
      loadNumber,
      currentLocation,
      locationName,
      address,
      city,
      state,
      tireRelated, // Not stored in current Ticket model
      tireSize, // Not stored
      tirePosition, // Not stored
      tireBrand, // Not stored
      damageDescription, // Not stored
    } = req.body;

    // Process file uploads (if any)
    const mediaPaths = req.files ? req.files.map((file) => file.path) : [];

    // Auto-generate a ticket number:
    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
    const lastTicketNumber = lastTicket
      ? parseInt(lastTicket.ticketNumber, 10)
      : 0;
    const newTicketNumber = (lastTicketNumber + 1).toString().padStart(5, "0");

    // Build the ticket data object. Map fields from the breakdown form to Ticket model fields.
    const ticketData = {
      ticketNumber: newTicketNumber,
      user: req.user._id, // Assumes the authenticated user is in req.user
      company: company || req.user.company, // Use provided company or default to user's company
      driverPhone: phoneNumber, // Use breakdown field phoneNumber
      truckNumber: tractorNumber, // Map tractorNumber to truckNumber
      vinLast8: vinLast8,
      mileage: req.body.mileage || 0, // Optionally provided, defaulting to 0 if missing
      trailerNumber: trailerNumber,
      loadStatus: loadStatus,
      loadNumber: loadStatus === "loaded" ? loadNumber : undefined,
      unitAffected: unitAffected,
      complaint: complaint,
      currentLocation: currentLocation,
      locationAddress: address || "",
      city: city || "",
      state: state || "",
      media: mediaPaths,
      status: "Open", // Default status on creation
    };

    // Create the ticket in the database
    const ticket = await Ticket.create(ticketData);
    // Populate the user and company fields so you can see their names
    await ticket.populate("user", "name");
    await ticket.populate("company", "name");

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// For Admins/Agents: Get all tickets (with populated fields)
exports.getAllTickets = async (req, res) => {
  try {
    // Check that the user is an admin or agent
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to view all tickets" });
    }
    const tickets = await Ticket.find()
      .populate("user", "name")
      .populate("company", "name");
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
    if (!req.user || !req.user.company) {
      return res
        .status(400)
        .json({ success: false, error: "User is not assigned to a company" });
    }
    const tickets = await Ticket.find({ company: req.user.company })
      .populate("user", "name")
      .populate("company", "name");
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
      return res
        .status(400)
        .json({ success: false, error: "User not authenticated properly" });
    }
    const tickets = await Ticket.find({ user: req.user._id })
      .populate("user", "name")
      .populate("company", "name");
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single ticket by ID with role-based access control and populated fields
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("user", "name")
      .populate("company", "name");
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, error: "Ticket not found" });
    }

    if (req.user.role === "admin" || req.user.role === "agent") {
      return res.status(200).json({ success: true, data: ticket });
    } else if (req.user.role === "driver") {
      if (ticket.user._id.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({
            success: false,
            error: "Not authorized to view this ticket",
          });
      }
      return res.status(200).json({ success: true, data: ticket });
    } else if (req.user.role === "company_user") {
      if (
        !req.user.company ||
        ticket.company._id.toString() !== req.user.company.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            error: "Not authorized to view this ticket",
          });
      }
      return res.status(200).json({ success: true, data: ticket });
    } else {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a ticket by ID with role-based access control
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, error: "Ticket not found" });
    }

    // Role-based access for updates:
    if (req.user.role === "admin" || req.user.role === "agent") {
      // Admins/Agents can update any ticket
    } else if (req.user.role === "driver") {
      // Drivers can update only their own tickets; you may add additional checks (e.g., time window)
      if (ticket.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({
            success: false,
            error: "Not authorized to update this ticket",
          });
      }
    } else if (req.user.role === "company_user") {
      // Company users can update only tickets for their company
      if (
        !req.user.company ||
        ticket.company.toString() !== req.user.company.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            error: "Not authorized to update this ticket",
          });
      }
    } else {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    // Proceed with the update if authorized
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: updatedTicket });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a ticket by ID with role-based access control
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, error: "Ticket not found" });
    }

    // Role-based access for deletion:
    if (req.user.role === "admin" || req.user.role === "agent") {
      // Allowed
    } else if (req.user.role === "driver") {
      // Drivers can delete only their own tickets
      if (ticket.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({
            success: false,
            error: "Not authorized to delete this ticket",
          });
      }
    } else if (req.user.role === "company_user") {
      // Company users can delete only tickets for their company
      if (
        !req.user.company ||
        ticket.company.toString() !== req.user.company.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            error: "Not authorized to delete this ticket",
          });
      }
    } else {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    await Ticket.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
