// server/seedTickets.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Company = require('./models/Company');

const seedTickets = async () => {
  try {
    await connectDB();

    // Clear the tickets collection first
    await Ticket.deleteMany({});

    // Retrieve all drivers (users with role 'driver') and companies
    const drivers = await User.find({ role: 'driver' });
    const companies = await Company.find({});

    const ticketPromises = [];

    // For each driver, create 2 tickets (select a random company for each)
    for (const driver of drivers) {
      for (let i = 1; i <= 2; i++) {
        // Choose a random company from the companies list
        const company = companies[Math.floor(Math.random() * companies.length)];

        // Generate a random 5-digit ticket number
        const randomTicketNumber = Math.floor(Math.random() * 100000)
          .toString()
          .padStart(5, '0');

        const ticketData = {
          ticketNumber: randomTicketNumber,
          user: driver._id, // Associate the ticket with the driver
          company: company._id,
          truckNumber: `TX${Math.floor(Math.random() * 10000)}`,
          vinLast8: 'VIN' + Math.floor(Math.random() * 10000000)
            .toString()
            .padStart(8, '0'),
          mileage: Math.floor(Math.random() * 200000),
          trailerNumber: `TR${Math.floor(Math.random() * 10000)}`,
          // Alternate loadStatus for variety
          loadStatus: i % 2 === 0 ? 'loaded' : 'empty',
          loadNumber: i % 2 === 0 ? `LOAD${Math.floor(Math.random() * 10000)}` : undefined,
          complaint: `Complaint ${i} for ${driver.name}: Engine overheating or brake failure.`,
          currentLocation: 'Test Location'
        };

        ticketPromises.push(Ticket.create(ticketData));
      }
    }

    const tickets = await Promise.all(ticketPromises);
    console.log(`Created ${tickets.length} tickets.`);
    tickets.forEach(ticket => {
      console.log(`Ticket ${ticket.ticketNumber} for driver ${ticket.user} - ${ticket._id}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("Error seeding tickets:", error);
    process.exit(1);
  }
};

seedTickets();
