// server/seedTickets.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

const generateUniqueTicketNumber = (existingNumbers) => {
  let ticketNumber;
  do {
    ticketNumber = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
  } while (existingNumbers.has(ticketNumber));
  existingNumbers.add(ticketNumber);
  return ticketNumber;
};

// Array of simpler complaint types
const complaintOptions = [
  "Mechanical",
  "Tires",
  "Brakes",
  "Jumpstart",
  "Lockout",
  "DOT",
  "PM Service"
];

const seedTickets = async () => {
  try {
    await connectDB();

    // Clear the tickets collection first
    await Ticket.deleteMany({});

    // Retrieve all drivers (users with role 'driver')
    const drivers = await User.find({ role: 'driver' });
    const ticketPromises = [];
    const generatedTicketNumbers = new Set();

    // For each driver, create 5 tickets using the driver's company
    for (const driver of drivers) {
      // Ensure the driver has a company assigned
      if (!driver.company) {
        console.warn(`Driver ${driver.name} (${driver._id}) has no company assigned. Skipping ticket creation.`);
        continue;
      }

      for (let i = 1; i <= 5; i++) {
        // Generate a unique 5-digit ticket number
        const randomTicketNumber = generateUniqueTicketNumber(generatedTicketNumbers);

        // Pick a random complaint from the array
        const randomComplaint = complaintOptions[Math.floor(Math.random() * complaintOptions.length)];

        // Randomly assign status (20% closed, 80% open) - tweak as desired
        const randomStatus = Math.random() < 0.2 ? "closed" : "open";

        const ticketData = {
          ticketNumber: randomTicketNumber,
          user: driver._id,         // Associate the ticket with the driver
          company: driver.company,  // Use the driver's company
          truckNumber: `TX${Math.floor(Math.random() * 10000)}`,
          vinLast8: 'VIN' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0'),
          mileage: Math.floor(Math.random() * 200000),
          trailerNumber: `TR${Math.floor(Math.random() * 10000)}`,
          // Alternate loadStatus for variety
          loadStatus: i % 2 === 0 ? 'loaded' : 'empty',
          loadNumber: i % 2 === 0 ? `LOAD${Math.floor(Math.random() * 10000)}` : undefined,
          // Use simpler complaint
          complaint: randomComplaint,
          currentLocation: 'Test Location',
          // Additional fields
          unitAffected: Math.random() < 0.5 ? 'tractor' : 'trailer',
          driverPhone: "555-123-4567",
          // Newly added status
          status: randomStatus
        };

        ticketPromises.push(Ticket.create(ticketData));
      }
    }

    const tickets = await Promise.all(ticketPromises);
    console.log(`Created ${tickets.length} tickets.`);
    tickets.forEach(ticket => {
      console.log(`Ticket ${ticket.ticketNumber} for driver ${ticket.user} - ${ticket._id} - Status: ${ticket.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding tickets:", error);
    process.exit(1);
  }
};

seedTickets();
