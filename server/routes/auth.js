// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Get the currently logged-in user profile
router.get('/me', protect, getCurrentUser);

module.exports = router;
