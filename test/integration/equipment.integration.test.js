
const request = require('supertest');
const app = require('../../index');
const { sequelize } = require('../../src/models');

describe('Equipment Integration (In-Memory)', () => {
  let adminToken;
  let eqID;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // create & login an Admin user
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'equipadmin@int.com',
        password: 'Admin123',
        name: 'EquipAdmin',
        role: 'Admin',
        major: 'NA',
        yearGroup: 2023
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'equipadmin@int.com', password: 'Admin123' })
      .expect(200);

    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/equipment', () => {
    it('Admin can add equipment', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '3D Printer' })
        .expect(201);

      expect(res.body.message).toBe('Equipment added successfully');
      eqID = res.body.equipment.EquipmentID;
    });
  });

  describe('GET /api/equipment', () => {
    it('lists all equipment', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.equipmentList)).toBe(true);
    });
  });

  describe('GET /api/equipment/:eqID', () => {
    it('returns 200 if found', async () => {
      const res = await request(app)
        .get(`/api/equipment/${eqID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.equipment.EquipmentID).toBe(eqID);
    });

    it('returns 404 if not found', async () => {
      await request(app)
        .get('/api/equipment/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/equipment/:eqID', () => {
    it('updates name if admin', async () => {
      const res = await request(app)
        .put(`/api/equipment/${eqID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Printer' })
        .expect(200);

      expect(res.body.message).toBe('Equipment updated successfully');
      expect(res.body.updatedEquipment.Name).toBe('Updated Printer');
    });
  });

  describe('DELETE /api/equipment/:eqID', () => {
    it('deletes the equipment', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${eqID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Equipment deleted successfully');
    });
  });
});
