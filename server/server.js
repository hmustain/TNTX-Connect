// server/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Ticket routes
const ticketRoutes = require('./routes/ticket');
app.use('/api/tickets', ticketRoutes);


app.get('/', (req, res) => {
  res.send('TNTX Connect Backend is running!');
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the server at: ${url}`);
});
