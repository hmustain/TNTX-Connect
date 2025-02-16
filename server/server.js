// server/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('TNTX Connect Backend is running!');
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the server at: ${url}`);
});
