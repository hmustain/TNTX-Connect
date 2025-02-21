// tests/chat.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Ensure this exports your Express app
const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
require('dotenv').config();
const connectDB = require('../config/db');

let token, testUser, testCompany, testTicket;

beforeAll(async () => {
  await connectDB();
  // Create a test company once for all tests.
  testCompany = await Company.create({ name: 'Chat Protected Company' });
});

beforeEach(async () => {
  // Clear out chats and tickets between tests.
  await Chat.deleteMany({});
  await Ticket.deleteMany({});
  
  // Delete any existing test users with emails starting with "chatprotected_"
  await User.deleteMany({ email: { $regex: '^chatprotected_' } });

  // Re-register the test user and update token.
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Chat Protected Tester',
      email: `chatprotected_${Date.now()}@example.com`,
      password: 'Test@1234'
    });
  token = userRes.body.token;
  testUser = userRes.body.data;

  // Create a test ticket for chat tests with a unique ticket number.
  const uniqueTicketNumber = (Math.floor(Math.random() * 100000))
    .toString()
    .padStart(5, '0');
  testTicket = await Ticket.create({
    ticketNumber: uniqueTicketNumber,
    user: testUser._id,
    company: testCompany._id,
    truckNumber: 'TX2001',
    vinLast8: 'VIN67890',
    mileage: 90000,
    trailerNumber: 'TR2001',
    loadStatus: 'empty',
    complaint: 'Engine issue',
    currentLocation: 'San Antonio, TX'
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Protected Chat Endpoints', () => {
  it('should create a new chat message when authenticated', async () => {
    const chatData = {
      ticket: testTicket._id,
      sender: testUser._id,
      message: 'Need assistance with the engine'
    };

    const res = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${token}`)
      .send(chatData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.message).toBe(chatData.message);
  });

  it('should get chat messages for a ticket when authenticated', async () => {
    const chatData = {
      ticket: testTicket._id,
      sender: testUser._id,
      message: 'This is a chat for the ticket'
    };

    // Create a chat message first
    await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${token}`)
      .send(chatData);

    // Retrieve chat messages for the ticket
    const res = await request(app)
      .get(`/api/chats/ticket/${testTicket._id}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
