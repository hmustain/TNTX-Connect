// server/seedChats.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Chat = require('./models/Chat');
const Ticket = require('./models/Ticket');

const seedChats = async () => {
  try {
    await connectDB();

    // Clear the chats collection first
    await Chat.deleteMany({});

    // Retrieve all tickets
    const tickets = await Ticket.find({});

    const chatPromises = [];

    // For each ticket, create 1 chat message with a breakdown-related message
    for (const ticket of tickets) {
      const chatData = {
        ticket: ticket._id,
        sender: ticket.user, // Use the ticket's user as the sender
        message: `Initial breakdown report for ticket ${ticket.ticketNumber}.`,
        company: ticket.company // Associate the chat with the ticket's company
      };
      chatPromises.push(Chat.create(chatData));
    }

    const chats = await Promise.all(chatPromises);
    console.log(`Created ${chats.length} chat messages.`);
    chats.forEach(chat => {
      console.log(`Chat for ticket ${chat.ticket} - ${chat._id}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("Error seeding chats:", error);
    process.exit(1);
  }
};

seedChats();
