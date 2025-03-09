// FILE: test/unit/equipment.controller.test.js
const request = require('supertest');
const app = require('../../index');
const { Equipment } = require('../../src/models');

jest.mock('../../src/models', () => {
  const actual = jest.requireActual('../../src/models');
  return {
    ...actual,
    Equipment: {
      create: jest.fn(),
      findByPk: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn()
    }
  };
});

describe('EquipmentController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/equipment', () => {
    it('should add new equipment if user is Admin', async () => {
      Equipment.create.mockResolvedValue({ EquipmentID: 100, Name: 'New Equip' });
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'New Equip' });
      expect(res.status).toBe(201);
      expect(res.body.equipment.Name).toBe('New Equip');
    });
  });

  describe('PUT /api/equipment/:equipmentID', () => {
    it('should update equipment details if user is Admin', async () => {
      const fakeEquip = { EquipmentID: 10, Name: 'OldName', save: jest.fn().mockResolvedValue({ EquipmentID: 10, Name: 'UpdatedName' }) };
      Equipment.findByPk.mockResolvedValue(fakeEquip);
      const res = await request(app)
        .put('/api/equipment/10')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'UpdatedName' });
      expect(res.status).toBe(200);
      expect(res.body.updatedEquipment.Name).toBe('UpdatedName');
    });
  });

  describe('DELETE /api/equipment/:equipmentID', () => {
    it('should delete equipment if user is Admin', async () => {
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 20 });
      Equipment.destroy.mockResolvedValue(1);
      const res = await request(app)
        .delete('/api/equipment/20')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Equipment deleted');
    });
  });

  describe('GET /api/equipment', () => {
    it('should return all equipment', async () => {
      Equipment.findAll.mockResolvedValue([
        { EquipmentID: 1, Name: 'Printer' },
        { EquipmentID: 2, Name: 'Laser Cutter' }
      ]);
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', 'Bearer valid-token');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.equipmentList)).toBe(true);
      expect(res.body.equipmentList.length).toBe(2);
    });
  });

  describe('GET /api/equipment/:equipmentID', () => {
    it('should return equipment details if found', async () => {
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 11, Name: '3D Printer' });
      const res = await request(app)
        .get('/api/equipment/11')
        .set('Authorization', 'Bearer valid-token');
      expect(res.status).toBe(200);
      expect(res.body.equipment.Name).toBe('3D Printer');
    });

    it('should return 404 if equipment not found', async () => {
      Equipment.findByPk.mockResolvedValue(null);
      const res = await request(app)
        .get('/api/equipment/999')
        .set('Authorization', 'Bearer valid-token');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Equipment not found');
    });
  });
});
