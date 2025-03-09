// FILE: test/unit/borrow.service.test.js
const BorrowService = require('../../src/services/borrow.service');
const { BorrowRequest, BorrowedItem, Equipment, User, AuditLog } = require('../../src/models');

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
    },
    Equipment: {
      findByPk: jest.fn()
    },
    AuditLog: {
      create: jest.fn()
    }
  };
});

describe('BorrowService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestEquipment', () => {
    it('should throw if user is not a Student', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Admin' });
      await expect(BorrowService.requestEquipment(1, [], new Date()))
        .rejects.toThrow('Invalid student or role');
    });

    it('should create a BorrowRequest and BorrowedItems', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Student', Name: 'Alice' });
      User.findOne.mockResolvedValue({ Email: 'admin@example.com' });
      BorrowRequest.create.mockResolvedValue({ RequestID: 101, CollectionDateTime: '2025-10-01T00:00:00Z' });
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 55 });
      BorrowedItem.create.mockResolvedValue({});
      BorrowedItem.findAll.mockResolvedValue([
        { Equipment: { Name: 'XYZ Printer' }, Quantity: 2, Description: 'For project' }
      ]);

      const result = await BorrowService.requestEquipment(2, [
        { equipmentID: 55, quantity: 2, description: 'For project' }
      ], '2025-10-01T00:00:00Z');
      expect(result.RequestID).toBe(101);
      expect(BorrowedItem.create).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Borrow' })
      );
    });
  });

  describe('approveRequest', () => {
    it('should throw if request not found or not pending', async () => {
      BorrowRequest.findByPk.mockResolvedValue(null);
      await expect(BorrowService.approveRequest(999, new Date(), []))
        .rejects.toThrow('Request not found or already processed');
    });

    it('should approve request and update BorrowedItems', async () => {
      const fakeRequest = { RequestID: 50, Status: 'Pending', save: jest.fn().mockResolvedValue() };
      BorrowRequest.findByPk.mockResolvedValue(fakeRequest);
      BorrowedItem.findByPk.mockResolvedValue({
        RequestID: 50,
        save: jest.fn().mockResolvedValue(),
        destroy: jest.fn().mockResolvedValue()
      });
      BorrowedItem.findAll.mockResolvedValue([{ Equipment: { Name: 'XYZ' }, Quantity: 2 }]);
      User.findByPk.mockResolvedValue({ Email: 'student@example.com', Role: 'Student', Name: 'Alice' });
      
      await BorrowService.approveRequest(50, new Date('2025-10-05T00:00:00Z'), [
        { borrowedItemID: 1, allow: true, description: 'desc', serialNumber: 'SN123' }
      ]);
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Approve' })
      );
    });
  });

  describe('returnEquipment', () => {
    it('should throw if request is not approved', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ Status: 'Pending' });
      await expect(BorrowService.returnEquipment(10))
        .rejects.toThrow('Invalid request or not in approved state');
    });

    it('should mark request as Returned and log it', async () => {
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 11,
        Status: 'Approved',
        save: jest.fn().mockResolvedValue()
      });
      User.findByPk.mockResolvedValue({ Name: 'Alice' });
      const result = await BorrowService.returnEquipment(11);
      expect(result.Status).toBe('Returned');
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Return' })
      );
    });
  });

  describe('sendReminderForDueReturns', () => {
    it('should send reminder if request is due in 2 days', async () => {
      BorrowRequest.findAll.mockResolvedValue([
        { RequestID: 7, UserID: 3, ReturnDate: '2025-12-10T00:00:00Z' }
      ]);
      User.findByPk.mockResolvedValue({ Name: 'Alice', Email: 'stud@example.com', Role: 'Student' });
      const count = await BorrowService.sendReminderForDueReturns();
      expect(count).toBe(1);
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Notify' })
      );
    });
  });

  describe('getItemsForRequest', () => {
    it('should throw if request not found', async () => {
      BorrowRequest.findByPk.mockResolvedValue(null);
      await expect(BorrowService.getItemsForRequest({ Role: 'Student', UserID: 1 }, 999))
        .rejects.toThrow('Request not found');
    });
    
    it('should return items if request exists and belongs to student', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 20, UserID: 2 });
      BorrowedItem.findAll.mockResolvedValue([{ Equipment: { Name: 'XYZ' }, Quantity: 1 }]);
      const items = await BorrowService.getItemsForRequest({ Role: 'Student', UserID: 2 }, 20);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);
    });
  });

  describe('getAllLogs', () => {
    it('should return all audit logs', async () => {
      AuditLog.findAll.mockResolvedValue([
        { LogID: 1, Action: 'Create' },
        { LogID: 2, Action: 'Update' }
      ]);
      const logs = await BorrowService.getAllLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(2);
    });
  });
});
