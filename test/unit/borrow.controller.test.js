// FILE: test/unit/borrow.controller.test.js
const request = require('supertest');
const app = require('../../index');
const { BorrowRequest, User, BorrowedItem } = require('../../src/models');

// Mock models for BorrowController tests
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
      findAll: jest.fn(),
      destroy: jest.fn()
    },
    User: {
      unscoped: jest.fn().mockReturnThis(),
      findByPk: jest.fn(),
      findOne: jest.fn()
    }
  };
});

// Bypass auth middleware by mocking it so that it always attaches a valid user.
jest.mock('../../src/middlewares/auth.middleware', () => {
  return (req, res, next) => {
    // For tests of student endpoints, we set Student; for admin endpoints, we override later.
    req.user = { UserID: 2, Role: 'Student', Name: 'Alice' };
    next();
  };
});

// Bypass role middleware similarly if necessary.
jest.mock('../../src/middlewares/role.middleware', () => {
  return (allowedRoles) => (req, res, next) => {
    req.user = { UserID: 2, Role: allowedRoles.includes('Admin') ? 'Admin' : 'Student', Name: 'Alice' };
    next();
  };
});

describe('BorrowController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/borrow/request', () => {
    it('should create a new borrow request if payload is valid and user is Student', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Student', Name: 'Alice' });
      User.findOne.mockResolvedValue({ Email: 'admin@example.com' });
      BorrowRequest.create.mockResolvedValue({ RequestID: 101, CollectionDateTime: '2025-10-01T10:00:00Z' });
      BorrowedItem.create.mockResolvedValue({});
      BorrowedItem.findAll.mockResolvedValue([
        { Equipment: { Name: 'XYZ Printer' }, Quantity: 2, Description: 'For project' }
      ]);
      
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', 'Bearer valid-student-token')
        .send({
          items: [{ equipmentID: 55, quantity: 2, description: 'For project' }],
          collectionDateTime: '2025-10-01T10:00:00Z'
        });
      expect(res.status).toBe(201);
      expect(res.body.borrowRequest.RequestID).toBe(101);
    });

    it('should return 400 if required field collectionDateTime is missing', async () => {
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', 'Bearer valid-student-token')
        .send({
          items: [{ equipmentID: 55, quantity: 2, description: 'For project' }]
          // collectionDateTime is missing
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"collectionDateTime" is required/i);
    });

    it('should return 400 if items array is missing or empty', async () => {
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', 'Bearer valid-student-token')
        .send({
          collectionDateTime: '2025-10-01T10:00:00Z'
          // items missing
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"items" is required/i);
    });

    it('should fail if user is not Student', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Admin' });
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          items: [],
          collectionDateTime: '2025-10-02T00:00:00Z'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid student or role');
    });
  });

  describe('PUT /api/borrow/approve/:requestID', () => {
    it('should approve the borrow request if payload is valid and user is Admin', async () => {
      // Override req.user to be Admin for this test
      const adminUser = { UserID: 2, Role: 'Admin', Name: 'AdminAlice' };
      User.findByPk.mockResolvedValue({ Email: 'stud@example.com', Role: 'Student', Name: 'Alice' });
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 50,
        Status: 'Pending',
        save: jest.fn().mockResolvedValue()
      });
      BorrowedItem.findByPk.mockResolvedValue({
        RequestID: 50,
        save: jest.fn().mockResolvedValue(),
        destroy: jest.fn().mockResolvedValue()
      });
      BorrowedItem.findAll.mockResolvedValue([{ Equipment: { Name: 'XYZ' }, Quantity: 2 }]);
      
      const res = await request(app)
        .put('/api/borrow/approve/50')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          returnDate: '2025-10-05T00:00:00Z',
          items: [{ borrowedItemID: 1, allow: true, description: 'desc', serialNumber: 'SN123' }]
        });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Request approved');
    });

    it('should return 400 if payload is invalid (e.g., missing returnDate)', async () => {
      const res = await request(app)
        .put('/api/borrow/approve/50')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          items: [{ borrowedItemID: 1, allow: true }]
          // Missing returnDate
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"returnDate" is required/i);
    });

    it('should fail if request is not pending', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 51, Status: 'Returned' });
      const res = await request(app)
        .put('/api/borrow/approve/51')
        .set('Authorization', 'Bearer valid-admin-token')
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
        save: jest.fn().mockResolvedValue()
      });
      User.findByPk.mockResolvedValue({ Name: 'Alice' });
      const res = await request(app)
        .put('/api/borrow/return/60')
        .set('Authorization', 'Bearer valid-admin-token')
        .send();
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Equipment returned');
    });
  });

  describe('GET /api/borrow/all-requests', () => {
    it('should retrieve all requests for admin', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 1 }, { RequestID: 2 }]);
      const res = await request(app)
        .get('/api/borrow/all-requests')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200);
      expect(res.body.requests.length).toBe(2);
    });
  });

  describe('GET /api/borrow/:requestID/items', () => {
    it('should return items for a given borrow request if valid', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 20, UserID: 2 });
      BorrowedItem.findAll.mockResolvedValue([{ Equipment: { Name: 'XYZ' }, Quantity: 1 }]);
      const res = await request(app)
        .get('/api/borrow/20/items')
        .set('Authorization', 'Bearer valid-token-for-student');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBe(1);
    });

    it('should return 400 if requestID is not a valid number', async () => {
      const res = await request(app)
        .get('/api/borrow/not-a-number/items')
        .set('Authorization', 'Bearer valid-token-for-student');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"requestID" must be a number/i);
    });
  });

  describe('GET /api/borrow/logs', () => {
    it('should return all logs for admin', async () => {
      const fakeLogs = [
        { LogID: 1, Action: 'Create', Details: 'Test log' },
        { LogID: 2, Action: 'Update', Details: 'Another log' }
      ];
      const BorrowService = require('../../src/services/borrow.service');
      jest.spyOn(BorrowService, 'getAllLogs').mockResolvedValue(fakeLogs);
      const res = await request(app)
        .get('/api/borrow/logs')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBe(2);
    });
  });
});
