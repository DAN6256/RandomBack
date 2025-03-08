const request = require('supertest');
const app = require('../../index');
const { sequelize, User, Equipment } = require('../../src/models');

let adminToken, studentToken;

describe('Borrow Routes (Integration)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create Admin
    await request(app).post('/api/auth/signup').send({
      email: 'admin@ashesi.edu.gh',
      password: 'Admin123',
      name: 'Admin User',
      role: 'Admin'
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ashesi.edu.gh', password: 'Admin123' });
    adminToken = adminLogin.body.token;

    // Create Student
    await request(app).post('/api/auth/signup').send({
      email: 'student@ashesi.edu.gh',
      password: 'Student123',
      name: 'Student User',
      role: 'Student'
    });
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@ashesi.edu.gh', password: 'Student123' });
    studentToken = studentLogin.body.token;

    // Create some Equipment
    await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Motor' }); // ID=1
    await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Sensor' }); // ID=2
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/borrow/request - Student requests multiple items', async () => {
    const res = await request(app)
      .post('/api/borrow/request')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        items: [
          { equipmentID: 1, quantity: 2, description: 'Need motors' },
          { equipmentID: 2, quantity: 1, description: 'One sensor' }
        ]
      });
    
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Request submitted');
    // We'll store requestID for later
  });

  test('PUT /api/borrow/approve/:requestID - Admin approves partially', async () => {
    // Suppose the BorrowRequest created above has RequestID=1
    // (In real code, you'd fetch from DB or from the previous test's response)
    const res = await request(app)
      .put('/api/borrow/approve/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        returnDate: "2025-12-01T00:00:00Z",
        items: [
          // If the BorrowedItemIDs are 1 & 2, we allow the first, disallow the second, etc.
          { borrowedItemID: 1, allow: true, serialNumber: "SN123" },
          { borrowedItemID: 2, allow: false }
        ]
      });
    
    // The partial approval means item2 is removed, only item1 remains
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Request approved');
  });

  test('PUT /api/borrow/return/:requestID - Admin marks returned', async () => {
    const res = await request(app)
      .put('/api/borrow/return/1')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Equipment returned');
  });

  test('POST /api/borrow/send-reminder - triggers reminders if any due soon', async () => {
    // This might do nothing if there's no request with ReturnDate = 2 days away
    const res = await request(app)
      .post('/api/borrow/send-reminder')
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200]).toContain(res.status); // Probably 200
    // Could test the message if "No due requests found to remind"
  });
});
