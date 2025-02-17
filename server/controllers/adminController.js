// server/controllers/adminController.js
const User = require('../models/User');
const Company = require('../models/Company');

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a user by ID (admin only)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a user by ID (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Change a user's role (admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    // Optionally validate that role is one of the allowed roles
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Suspend or activate a user account (admin only)
exports.setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Create a new company (admin only)
exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a company by ID (admin only)
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.status(200).json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a company by ID (admin only)
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
