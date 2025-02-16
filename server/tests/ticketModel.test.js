// tests/ticketModel.test.js
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
const connectDB = require('../config/db');
require('dotenv').config();

let testUser;
let testCompany;

beforeAll(async () => {
  await connectDB();

  // Create a test user
  testUser = new User({
    name: 'Ticket Tester',
    email: 'tickettester@example.com',
    password: 'Test@1234'
  });
  await testUser.save();

  // Create a test company
  testCompany = new Company({ name: 'Ticket Test Company' });
  await testCompany.save();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Ticket Model Test', () => {
  it('should create & save ticket successfully', async () => {
    const ticketData = {
      ticketNumber: '00001',
      user: testUser._id,
      company: testCompany._id,
      truckNumber: 'TX1234',
      vinLast8: 'ABC12345',
      mileage: 100000,
      trailerNumber: 'TR5678',
      loadStatus: 'loaded',
      loadNumber: 'LOAD001',
      complaint: 'Engine overheating',
      currentLocation: 'Dallas, TX'
    };

    const ticket = new Ticket(ticketData);
    const savedTicket = await ticket.save();

    expect(savedTicket._id).toBeDefined();
    expect(savedTicket.ticketNumber).toBe(ticketData.ticketNumber);
    expect(savedTicket.loadStatus).toBe('loaded');
  });

  it('should not save ticket without required fields', async () => {
    const ticketWithoutRequiredFields = new Ticket({});
    let err;
    try {
      await ticketWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    // For example, ticketNumber, user, company, truckNumber, etc. are required.
    expect(err.errors.ticketNumber).toBeDefined();
    expect(err.errors.user).toBeDefined();
    expect(err.errors.company).toBeDefined();
  });
});
