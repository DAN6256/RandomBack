/**
 * test/unit/borrow.controller.test.js
 *
 * Tests for the /api/borrow routes using supertest.
 */
const request = require('supertest');
const app = require('../../index'); // main server
const { BorrowRequest, User, BorrowedItem } = require('../../src/models');

// We'll partially mock out some DB calls
jest.mock('../../src/models', () => {
  const actual = jest.requireActual('../../src/models');
  return {
    ...actual,
    BorrowRequest: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn()
    },
    BorrowedItem: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn()
    },
    User: {
      findByPk: jest.fn(),
      findOne: jest.fn()
    }
  };
});

describe('BorrowController', () => {
  afterAll(async () => {
    // if needed, close connections
  });

  describe('POST /api/borrow/request', () => {
    it('should create a new borrow request if user is Student', async () => {
      // Mock DB calls
      User.findByPk.mockResolvedValue({ Role: 'Student' });
      User.findOne.mockResolvedValue({ Role: 'Admin', Email: 'admin@example.com' });
      BorrowRequest.create.mockResolvedValue({ RequestID: 101 });
      BorrowedItem.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/borrow/request')
        // normally we'd add an auth token, but for brevity let's skip
        .send({
          items: [{ equipmentID: 10, quantity: 2 }],
          collectionDateTime: '2025-10-01T10:00:00Z'
        });

      expect(res.status).toBe(201);
      expect(res.body.borrowRequest.RequestID).toBe(101);
    });

    it('should fail if user is not Student', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Admin' });

      const res = await request(app)
        .post('/api/borrow/request')
        .send({ items: [], collectionDateTime: '2025-10-02' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid student or role');
    });
  });

  describe('PUT /api/borrow/approve/:requestID', () => {
    it('should approve the borrow request if user is admin', async () => {
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 50,
        Status: 'Pending',
        save: jest.fn()
      });
      BorrowedItem.findByPk.mockResolvedValue({
        RequestID: 50,
        save: jest.fn(),
        destroy: jest.fn()
      });
      BorrowedItem.findAll.mockResolvedValue([]);
      User.findByPk.mockResolvedValue({ Email: 'stud@example.com', Role: 'Student' });

      const res = await request(app)
        .put('/api/borrow/approve/50')
        .send({
          returnDate: '2025-10-05T00:00:00Z',
          items: [{ borrowedItemID: 1, allow: true }]
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Request approved');
    });

    it('should fail if request not pending', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 51, Status: 'Returned' });

      const res = await request(app)
        .put('/api/borrow/approve/51')
        .send({
          returnDate: '2025-10-05T00:00:00Z',
          items: []
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Request not found or already processed');
    });
  });

  describe('PUT /api/borrow/return/:requestID', () => {
    it('should mark request as returned', async () => {
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 60,
        Status: 'Approved',
        save: jest.fn()
      });

      const res = await request(app)
        .put('/api/borrow/return/60')
        .send();
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Equipment returned');
    });
  });

  describe('GET /api/borrow/all-requests', () => {
    it('should retrieve all requests (or user’s requests) - mock example', async () => {
      BorrowRequest.findAll.mockResolvedValue([
        { RequestID: 1 }, { RequestID: 2 }
      ]);

      const res = await request(app)
        .get('/api/borrow/all-requests');
      expect(res.status).toBe(200);
      expect(res.body.requests.length).toBe(2);
    });
  });
});
