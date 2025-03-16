/**
 * @file borrow.integration.test.js
 * Integration tests for borrowing endpoints.
 */
const request = require('supertest');
const app = require('../../index');
const { sequelize } = require('../../src/models');

describe('Borrow Integration', () => {
  let studentToken;
  let adminToken;
  let requestID; // store the borrow request ID

  beforeAll(async () => {
    // await sequelize.sync({ force: true });
    // Create a student and admin, then login them to get tokens

    // 1) sign up a Student
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'student@int.com',
        password: 'StudentPass1',
        name: 'Student One',
        role: 'Student',
        major: 'CS',
        yearGroup: 2025
      });

    // 2) sign up an Admin
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'admin@int.com',
        password: 'AdminPass1',
        name: 'Admin One',
        role: 'Admin',
        major: 'NA',
        yearGroup: 2023
      });

    // 3) login Student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@int.com', password: 'StudentPass1' });
    studentToken = studentRes.body.token;

    // 4) login Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@int.com', password: 'AdminPass1' });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/borrow/request', () => {
    it('Student can request equipment', async () => {
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [{ equipmentID: 1, quantity: 2 }], 
          collectionDateTime: "2026-01-01T10:00:00Z"
        })
        .expect(201);

      expect(res.body.message).toBe('Request submitted');
      requestID = res.body.borrowRequest.RequestID;
    });

    it('fails if not a Student', async () => {
      // Admin tries
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ equipmentID: 2, quantity: 1 }],
          collectionDateTime: "2026-01-05T10:00:00Z"
        })
        .expect(403);

      expect(res.body.message).toMatch(/Forbidden/i);
    });
  });

  describe('PUT /api/borrow/approve/:requestID', () => {
    it('Admin can approve a request', async () => {
      const res = await request(app)
        .put(`/api/borrow/approve/${requestID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          returnDate: "2026-02-01T00:00:00Z",
          items: [
            { borrowedItemID: 1, allow: true } // we assume item #1?
          ]
        })
        .expect(200);

      expect(res.body.message).toBe('Request approved');
      expect(res.body.approvedRequest.Status).toBe('Approved');
    });

    it('fails if not Admin', async () => {
      await request(app)
        .put(`/api/borrow/approve/${requestID}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ returnDate: "2026-02-01T00:00:00Z", items: [] })
        .expect(403);
    });
  });

  describe('PUT /api/borrow/return/:requestID', () => {
    it('Admin can mark an item returned', async () => {
      const res = await request(app)
        .put(`/api/borrow/return/${requestID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Equipment returned');
      expect(res.body.returnedRequest.RequestID).toBe(requestID);
    });
  });

  describe('POST /api/borrow/send-reminder', () => {
    it('Admin triggers reminders', async () => {
      const res = await request(app)
        .post('/api/borrow/send-reminder')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Reminders sent successfully');
    });
  });
});
