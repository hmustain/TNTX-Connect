// tests/ticketEndpoints.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); 
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
require('dotenv').config();
const connectDB = require('../config/db');

let testUser, testCompany;

beforeAll(async () => {
  await connectDB();
  // Create a test user
  testUser = new User({
    name: 'Ticket Endpoint Tester',
    email: `tickettester_${Date.now()}@example.com`,
    password: 'Test@1234'
  });
  await testUser.save();

  // Create a test company
  testCompany = new Company({ name: 'Ticket Endpoint Company' });
  await testCompany.save();
});

// Clean up Ticket collection before each test
beforeEach(async () => {
  await Ticket.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Ticket Endpoints', () => {
  it('should create a new ticket with an auto-generated ticket number', async () => {
    const ticketData = {
      user: testUser._id,
      company: testCompany._id,
      truckNumber: 'TX1001',
      vinLast8: 'VIN12345',
      mileage: 120000,
      trailerNumber: 'TR1001',
      loadStatus: 'loaded',
      loadNumber: 'LOAD1001',
      complaint: 'Brake failure',
      currentLocation: 'Houston, TX'
    };

    const res = await request(app)
      .post('/api/tickets')
      .send(ticketData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    // Verify that ticketNumber is generated and is a 5-digit string
    expect(res.body.data.ticketNumber).toMatch(/^\d{5}$/);
  });

  it('should get all tickets', async () => {
    // Create a sample ticket first
    const ticketData = {
      user: testUser._id,
      company: testCompany._id,
      truckNumber: 'TX1002',
      vinLast8: 'VIN54321',
      mileage: 130000,
      trailerNumber: 'TR1002',
      loadStatus: 'empty',
      complaint: 'Flat tire',
      currentLocation: 'Austin, TX'
    };

    await request(app).post('/api/tickets').send(ticketData);

    const res = await request(app).get('/api/tickets');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
