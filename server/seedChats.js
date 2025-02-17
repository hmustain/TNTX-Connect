// server/seedChats.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Chat = require('./models/Chat');
const Ticket = require('./models/Ticket');

// A sample array of breakdown-related messages
const breakdownMessages = [
  "Engine overheating, need assistance ASAP.",
  "Brake failure reported, please dispatch help.",
  "Flat tire, roadside assistance required.",
  "Oil leak detected, need a mechanic.",
  "Transmission issues, vehicle stuck."
];

const seedChats = async () => {
  try {
    await connectDB();

    // Clear the chats collection first
    await Chat.deleteMany({});

    // Retrieve all tickets
    const tickets = await Ticket.find({});

    const chatPromises = [];

    // For each ticket, create 5 chat messages with varied messages.
    for (const ticket of tickets) {
      for (let j = 1; j <= 5; j++) {
        // Select a random message from the breakdownMessages array
        const message = breakdownMessages[Math.floor(Math.random() * breakdownMessages.length)];

        const chatData = {
          ticket: ticket._id,
          sender: ticket.user, // Use the ticket's user as the sender
          message: message + ` (Message ${j} for ticket ${ticket.ticketNumber})`
        };

        chatPromises.push(Chat.create(chatData));
      }
    }

    const chats = await Promise.all(chatPromises);
    console.log(`Created ${chats.length} chat messages.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding chats:", error);
    process.exit(1);
  }
};

seedChats();
