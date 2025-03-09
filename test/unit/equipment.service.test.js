// FILE: test/unit/equipment.service.test.js
const EquipmentService = require('../../src/services/equipment.service');
const { Equipment, AuditLog, User } = require('../../src/models');

jest.mock('../../src/models', () => {
  const actual = jest.requireActual('../../src/models');
  return {
    ...actual,
    Equipment: {
      create: jest.fn(),
      findByPk: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn()
    },
    AuditLog: {
      create: jest.fn()
    },
    User: {
      unscoped: jest.fn().mockReturnThis(),
      findByPk: jest.fn()
    }
  };
});

describe('EquipmentService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addEquipment', () => {
    it('should create equipment and log the action', async () => {
      Equipment.create.mockResolvedValue({ EquipmentID: 123, Name: '3D Printer' });
      AuditLog.create.mockResolvedValue({});
      const result = await EquipmentService.addEquipment('3D Printer', 1);
      expect(result.EquipmentID).toBe(123);
      expect(Equipment.create).toHaveBeenCalledWith({ Name: '3D Printer' });
      expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ Action: 'Create' }));
    });
  });

  describe('updateEquipment', () => {
    it('should throw an error if equipment not found', async () => {
      Equipment.findByPk.mockResolvedValue(null);
      await expect(EquipmentService.updateEquipment(999, 'NewName', 2))
        .rejects.toThrow('Equipment not found');
    });

    it('should update equipment and log the action', async () => {
      const fakeEquipment = { EquipmentID: 10, Name: 'OldName', save: jest.fn().mockResolvedValue() };
      Equipment.findByPk.mockResolvedValue(fakeEquipment);
      AuditLog.create.mockResolvedValue({});
      const updated = await EquipmentService.updateEquipment(10, 'NewName', 2);
      expect(fakeEquipment.save).toHaveBeenCalled();
      expect(updated.Name).toBe('NewName');
      expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ Action: 'Update' }));
    });
  });

  describe('deleteEquipment', () => {
    it('should throw an error if equipment not found', async () => {
      Equipment.findByPk.mockResolvedValue(null);
      await expect(EquipmentService.deleteEquipment(999, 2))
        .rejects.toThrow('Equipment not found');
    });

    it('should delete equipment and log the deletion', async () => {
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 20 });
      Equipment.destroy.mockResolvedValue(1);
      AuditLog.create.mockResolvedValue({});
      const result = await EquipmentService.deleteEquipment(20, 2);
      expect(result).toEqual({ message: 'Equipment deleted' });
      expect(Equipment.destroy).toHaveBeenCalledWith({ where: { EquipmentID: 20 } });
      expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ Action: 'Delete' }));
    });
  });

  describe('getAllEquipment', () => {
    it('should return all equipment', async () => {
      Equipment.findAll.mockResolvedValue([
        { EquipmentID: 1, Name: 'Printer' },
        { EquipmentID: 2, Name: 'Laser Cutter' }
      ]);
      const list = await EquipmentService.getAllEquipment();
      expect(list.length).toBe(2);
      expect(list[0].Name).toBe('Printer');
    });
  });

  describe('getEquipmentById', () => {
    it('should throw an error if equipment not found', async () => {
      Equipment.findByPk.mockResolvedValue(null);
      await expect(EquipmentService.getEquipmentById(999))
        .rejects.toThrow('Equipment not found');
    });

    it('should return equipment details if found', async () => {
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 11, Name: '3D Printer' });
      const equipment = await EquipmentService.getEquipmentById(11);
      expect(equipment.Name).toBe('3D Printer');
    });
  });
});
