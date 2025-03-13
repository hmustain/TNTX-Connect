require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const { client } = require('./utils/cache');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Auth Route
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Ticket Route
const ticketRoutes = require('./routes/ticket');
app.use('/api/tickets', ticketRoutes);

// Chat Route
const chatRoutes = require('./routes/chat');
app.use('/api/chats', chatRoutes);

// Admin Route
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Trimble Route
const { router: trimbleRouter } = require('./routes/trimble');
app.use('/api/trimble', trimbleRouter);

// Trimble Test Route
const trimbleTestRoutes = require('./routes/trimbleTest');
app.use('/api/trimble-test', trimbleTestRoutes);

app.get('/', (req, res) => {
  res.send('TNTX Connect Backend is running!');
});

// Flush Redis cache in development mode
if (process.env.NODE_ENV === 'development') {
  client.flushAll()
    .then(() => console.log("Redis cache flushed"))
    .catch(err => console.error("Error flushing Redis cache:", err));
}

// Only start the server if this file is run directly, not when imported for testing.
if (require.main === module) {
  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the server at: ${url}`);
  });
}

// error handling middleware
const { errorHandler } = require('./middleware/error');
app.use(errorHandler);

module.exports = app;
