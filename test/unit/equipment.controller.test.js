const EquipmentController = require('../../src/controllers/equipment.controller');
const EquipmentService = require('../../src/services/equipment.service');

jest.mock('../../src/services/equipment.service');

describe('EquipmentController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('addEquipment', () => {
    it('should return 201 with the new equipment', async () => {
      req.body = { name: '3D Printer' };
      req.user = { UserID: 99 };
      EquipmentService.addEquipment.mockResolvedValue({ EquipmentID: 1, Name: '3D Printer' });

      await EquipmentController.addEquipment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Equipment added successfully',
        equipment: { EquipmentID: 1, Name: '3D Printer' }
      });
    });

    it('should return 400 on error', async () => {
      EquipmentService.addEquipment.mockRejectedValue(new Error('Oops!'));

      await EquipmentController.addEquipment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Oops!' });
    });
  });
});
