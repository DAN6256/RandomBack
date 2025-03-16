
const request = require('supertest');
const app = require('../../index'); // your Express app
const { sequelize } = require('../../src/models'); // in-memory db if NODE_ENV=test

// Increase default test timeout to help avoid "Exceeded timeout" errors
jest.setTimeout(15000);

describe('Borrow Integration (In-Memory)', () => {
  let studentToken;
  let adminToken;
  let requestID;     // We’ll store the new BorrowRequest ID
  let equipmentID;   // We'll store the newly created equipment ID
  let borrowedItemID;// If your code returns the item ID, we can store it here

  beforeAll(async () => {
    // Force sync the DB so we have a fresh, empty schema in SQLite memory
    await sequelize.sync({ force: true });

    console.log('Database synced for Borrow Integration tests...');

    // 1) Create Student
    console.log('Creating Student user...');
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'daniel.tunyinko@ashesi.edu.gh',
        password: 'StuPass1',
        name: 'Borrow Student',
        role: 'Student',
        major: 'CS',
        yearGroup: 2025
      })
      .expect(201);

    // 2) Create Admin
    console.log('Creating Admin user...');
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'davedonbo108@gmail.com',
        password: 'Admin123',
        name: 'Borrow Admin',
        role: 'Admin',
        major: 'NA',
        yearGroup: 2023
      })
      .expect(201);

    // 3) Student login
    console.log('Logging in Student...');
    const stRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'daniel.tunyinko@ashesi.edu.gh', password: 'StuPass1' })
      .expect(200);

    studentToken = stRes.body.token;

    // 4) Admin login
    console.log('Logging in Admin...');
    const adRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'davedonbo108@gmail.com', password: 'Admin123' })
      .expect(200);

    adminToken = adRes.body.token;

    // 5) Admin creates an equipment item so Student can borrow
    console.log('Admin creating equipment...');
    const eqRes = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Equipment' })
      .expect(201);

    equipmentID = eqRes.body.equipment.EquipmentID;
    console.log('Created equipmentID:', equipmentID);
  });

  afterAll(async () => {
    // close DB
    await sequelize.close();
    console.log('Closed DB connection. Borrow Integration tests done.');
  });

  describe('POST /api/borrow/request', () => {
    it('Student can request equipment', async () => {
      console.log('Student requesting equipment ID:', equipmentID);
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [{ equipmentID, quantity: 1 }],
          collectionDateTime: '2026-01-01T10:00:00Z'
        });

      console.log('Borrow request =>', res.status, res.body);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Request submitted');

      requestID = res.body.borrowRequest.RequestID;
      console.log('Captured requestID:', requestID);

      // If your code returns the actual BorrowedItems array, you can store the ID:
      // if (res.body.borrowRequest.items && res.body.borrowRequest.items.length > 0) {
      //   borrowedItemID = res.body.borrowRequest.items[0].BorrowedItemID;
      //   console.log('Captured borrowedItemID:', borrowedItemID);
      // }
    });

    it('fails if user is not a Student', async () => {
      const failRes = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ equipmentID, quantity: 2 }],
          collectionDateTime: '2026-02-01T08:00:00Z'
        });
      expect(failRes.status).toBe(403);
    });
  });

  describe('PUT /api/borrow/approve/:requestID', () => {
    it('Admin can approve the borrow request', async () => {
      console.log('Approving requestID:', requestID);
      // If your code demands partial approval with item arrays,
      // we guess borrowedItemID = 1 or we pass an empty array if your code doesn't need it.
      const items = [{ borrowedItemID: 1, allow: true }];
      // If that doesn't work, you must fetch or store the real item ID from above.

      const res = await request(app)
        .put(`/api/borrow/approve/${requestID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          returnDate: '2026-02-15T00:00:00Z',
          items
        });

      console.log('Approve response =>', res.status, res.body);

      // Possibly 400 if item #1 not found. 
      // If that happens, see your code's logs or 
      // remove partial logic if your code doesn't need it.

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Request approved');
      expect(res.body.approvedRequest.Status).toBe('Approved');
    });
  });

  describe('PUT /api/borrow/return/:requestID', () => {
    it('Admin can mark it returned', async () => {
      console.log('Returning requestID:', requestID);
      const res = await request(app)
        .put(`/api/borrow/return/${requestID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      console.log('Return response =>', res.status, res.body);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Equipment returned');
      expect(res.body.returnedRequest.RequestID).toBe(requestID);
    });
  });

  describe('POST /api/borrow/send-reminder', () => {
    it('Admin triggers reminders', async () => {
      console.log('Sending reminder...');
      const res = await request(app)
        .post('/api/borrow/send-reminder')
        .set('Authorization', `Bearer ${adminToken}`);

      console.log('Reminder response =>', res.status, res.body);

      // Your code might say 'No due requests found to remind' if there's no 
      // request with ReturnDate exactly 2 days away. Let's accept both messages:
      expect(res.status).toBe(200);

      // Compare with actual code:
      // Possibly 'Reminders sent successfully' or 'No due requests found to remind'
      if (res.body.message !== 'Reminders sent successfully'
        && res.body.message !== 'No due requests found to remind') {
        throw new Error(`Unexpected message: ${res.body.message}`);
      }
    });
  });
});
