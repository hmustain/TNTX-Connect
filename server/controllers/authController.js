// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company')

// server/controllers/authController.js

const registerUser = async (req, res) => {
  try {
    const { name, email, password, companyIdentifier, role } = req.body;

    // Find the company by name or by trimbleCode (case-insensitive for name)
    const company = await Company.findOne({
      $or: [
        { name: { $regex: new RegExp("^" + companyIdentifier + "$", "i") } },
        { trimbleCode: { $regex: new RegExp("^" + companyIdentifier + "$", "i") } }
      ]
    });    

    if (!company) {
      return res.status(400).json({
        success: false,
        error: "Company not found. Please enter a valid company identifier."
      });
    }

    // Create a new user with the company ID assigned
    const user = await User.create({
      name,
      email,
      password,
      role,
      company: company._id // Assign the correct company ObjectId
    });

    // Populate the company field before sending response
    await user.populate('company', 'name trimbleCode');

    // Generate JWT token for authentication
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      data: user,
      token,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};



// Function to log in an existing user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Please provide email and password' });
    }
    // Find user by email, select password explicitly if it's excluded, and populate company
    const user = await User.findOne({ email })
      .select('+password')
      .populate('company', 'name');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    // Verify that the password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.status(200).json({
      success: true,
      data: user,
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Function to get the current user's profile
const getCurrentUser = async (req, res) => {
  try {
    // req.user should be populated by the protect middleware.
    // Populate the company field before returning the user.
    const user = await req.user.populate('company', 'name');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };
