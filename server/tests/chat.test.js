// tests/chatEndpoints.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
require('dotenv').config();
const connectDB = require('../config/db');

let testUser, testCompany, testTicket;

beforeAll(async () => {
  await connectDB();

  // Create a test user
  testUser = new User({
    name: 'Chat Endpoint Tester',
    email: `chattester_${Date.now()}@example.com`,
    password: 'Test@1234'
  });
  await testUser.save();

  // Create a test company
  testCompany = new Company({ name: 'Chat Endpoint Company' });
  await testCompany.save();
});

beforeEach(async () => {
  // Clear out chats and tickets between tests
  await Chat.deleteMany({});
  await Ticket.deleteMany({});

  // Create a new test ticket for chat tests
  testTicket = new Ticket({
    ticketNumber: '00003',
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
  await testTicket.save();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Chat Endpoints', () => {
  it('should create a new chat message', async () => {
    const chatData = {
      ticket: testTicket._id,
      sender: testUser._id,
      message: 'Need assistance with the engine'
    };

    const res = await request(app)
      .post('/api/chats')
      .send(chatData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.message).toBe(chatData.message);
  });

  it('should get chat messages for a ticket', async () => {
    // Create a chat message
    const chatData = {
      ticket: testTicket._id,
      sender: testUser._id,
      message: 'This is a chat for the ticket'
    };
    await request(app).post('/api/chats').send(chatData);

    const res = await request(app).get(`/api/chats/ticket/${testTicket._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
