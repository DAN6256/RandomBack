/**
 * @file equipment.controller.test.js
 */
const EquipmentController = require('../../src/controllers/equipment.controller');
const EquipmentService = require('../../src/services/equipment.service');

jest.mock('../../src/services/equipment.service');

describe('EquipmentController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addEquipment', () => {
    it('should respond 201 on success', async () => {
      EquipmentService.addEquipment.mockResolvedValue({ EquipmentID: 10, Name: '3D Printer' });

      const req = {
        body: { name: '3D Printer' },
        user: { UserID: 1 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.addEquipment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Equipment added successfully',
        equipment: { EquipmentID: 10, Name: '3D Printer' }
      });
    });

    it('should respond 400 if error', async () => {
      EquipmentService.addEquipment.mockRejectedValue(new Error('error'));

      const req = { body: {}, user: { UserID: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.addEquipment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('updateEquipment', () => {
    it('should respond 200 on success', async () => {
      EquipmentService.updateEquipment.mockResolvedValue({
        EquipmentID: 20, Name: 'Updated Printer'
      });

      const req = {
        params: { equipmentID: 20 },
        body: { name: 'Updated Printer' },
        user: { UserID: 2 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.updateEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Equipment updated successfully',
        updatedEquipment: { EquipmentID: 20, Name: 'Updated Printer' }
      });
    });

    it('should respond 400 if error thrown', async () => {
      EquipmentService.updateEquipment.mockRejectedValue(new Error('Not found'));
      const req = { params: { equipmentID: 99 }, body: {}, user: { UserID: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.updateEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });

  describe('deleteEquipment', () => {
    it('should respond 200 if deleted', async () => {
      EquipmentService.deleteEquipment.mockResolvedValue({ message: 'Equipment deleted' });

      const req = { params: { equipmentID: 30 }, user: { UserID: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.deleteEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipment deleted successfully' });
    });

    it('should respond 400 if error', async () => {
      EquipmentService.deleteEquipment.mockRejectedValue(new Error('error'));
      const req = { params: { equipmentID: 999 }, user: { UserID: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.deleteEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('getAllEquipment', () => {
    it('should respond 200 with list', async () => {
      EquipmentService.getAllEquipment.mockResolvedValue([{ EquipmentID: 1 }]);
      const req = {}, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.getAllEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ equipmentList: [{ EquipmentID: 1 }] });
    });

    it('should respond 400 if error', async () => {
      EquipmentService.getAllEquipment.mockRejectedValue(new Error('error'));
      const req = {}, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.getAllEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('getEquipmentById', () => {
    it('should respond 200 if found', async () => {
      EquipmentService.getEquipmentById.mockResolvedValue({ EquipmentID: 5, Name: 'Scanner' });
      const req = { params: { equipmentID: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.getEquipmentById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ equipment: { EquipmentID: 5, Name: 'Scanner' } });
    });

    it('should respond 404 if not found', async () => {
      EquipmentService.getEquipmentById.mockRejectedValue(new Error('Equipment not found'));
      const req = { params: { equipmentID: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await EquipmentController.getEquipmentById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipment not found' });
    });
  });
});
