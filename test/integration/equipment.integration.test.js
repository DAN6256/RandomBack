const request = require('supertest');
const app = require('../../index');
const { sequelize, User } = require('../../src/models');

let adminToken;

describe('Equipment Routes (Integration)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create an admin user via direct DB call or sign up route
    await request(app).post('/api/auth/signup').send({
      email: 'admin@ashesi.edu.gh',
      password: 'Admin123',
      name: 'Admin User',
      role: 'Admin'
    });
    
    // Login admin to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@ashesi.edu.gh',
        password: 'Admin123'
      });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/equipment - create new equipment as Admin', async () => {
    const res = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '3D Printer' });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('equipment');
    expect(res.body.equipment.Name).toBe('3D Printer');
  });

  test('GET /api/equipment - list all equipment', async () => {
    const res = await request(app)
      .get('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.equipmentList)).toBe(true);
    expect(res.body.equipmentList.length).toBe(1);
  });

  test('PUT /api/equipment/:id - update equipment', async () => {
    // Suppose we already have 1 piece of equipment with EquipmentID = 1
    const res = await request(app)
      .put('/api/equipment/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Printer' });

    expect(res.status).toBe(200);
    expect(res.body.updatedEquipment.Name).toBe('Updated Printer');
  });

  test('DELETE /api/equipment/:id - remove equipment', async () => {
    const res = await request(app)
      .delete('/api/equipment/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Equipment deleted successfully');

    // Check it's gone
    const res2 = await request(app)
      .get('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res2.body.equipmentList.length).toBe(0);
  });
});
