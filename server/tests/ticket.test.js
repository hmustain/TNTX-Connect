// tests/ticket.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); 
const User = require('../models/User');
const Company = require('../models/Company');
const Ticket = require('../models/Ticket'); // For cleanup
require('dotenv').config();
const connectDB = require('../config/db');

let token, testUser, testCompany;

beforeAll(async () => {
  await connectDB();
  
  // Create a test user and get a token
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Protected Test User',
      email: `protected_${Date.now()}@example.com`,
      password: 'Test@1234'
    });
  token = userResponse.body.token;
  testUser = userResponse.body.data;

  // Create a test company
  testCompany = await Company.create({ name: 'Protected Test Company' });
});

beforeEach(async () => {
  // Clear out tickets before each test
  await Ticket.deleteMany({});

  // Ensure testUser exists in the database
  const existingUser = await User.findById(testUser._id);
  if (!existingUser) {
    // Re-register the user if not found
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: testUser.name,
        email: testUser.email, // Use the same email
        password: 'Test@1234'
      });
    token = userResponse.body.token;
    testUser = userResponse.body.data;
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Protected Ticket Endpoints', () => {
  it('should create a new ticket when authenticated', async () => {
    const ticketData = {
      // Force the ticket to be associated with the authenticated user
      // even if a user field is provided in req.body, our controller should overwrite it.
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
      .set('Authorization', `Bearer ${token}`)
      .send(ticketData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    // Verify that ticketNumber is auto-generated and is a 5-digit string
    expect(res.body.data.ticketNumber).toMatch(/^\d{5}$/);
  });

  it('should get all tickets when authenticated', async () => {
    // Create two tickets (without specifying ticketNumber so it auto-generates)
    const ticketData1 = {
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

    const ticketData2 = {
      user: testUser._id,
      company: testCompany._id,
      truckNumber: 'TX1003',
      vinLast8: 'VIN98765',
      mileage: 110000,
      trailerNumber: 'TR1003',
      loadStatus: 'loaded',
      loadNumber: 'LOAD1002',
      complaint: 'Engine overheating',
      currentLocation: 'Dallas, TX'
    };

    await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(ticketData1);
    await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(ticketData2);

    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Expect exactly 2 tickets
    expect(res.body.data.length).toEqual(2);
  });

  it('should get only my tickets when authenticated', async () => {
    // Create one ticket for the current user
    const ticketData = {
      user: testUser._id,
      company: testCompany._id,
      truckNumber: 'TX1004',
      vinLast8: 'VIN11111',
      mileage: 90000,
      trailerNumber: 'TR1004',
      loadStatus: 'empty',
      complaint: 'Oil leak',
      currentLocation: 'San Antonio, TX'
    };

    await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(ticketData);

    // Retrieve "my tickets" using the /mytickets endpoint
    const res = await request(app)
      .get('/api/tickets/mytickets')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Since we only created one ticket, the length should be 1
    expect(res.body.data.length).toEqual(1);
    // Verify that the returned ticket's user matches testUser._id
    res.body.data.forEach(ticket => {
      expect(ticket.user).toEqual(String(testUser._id));
    });
  });
});
