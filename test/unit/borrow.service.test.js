/**
 * @file borrow.service.test.js
 */
const BorrowService = require('../../src/services/borrow.service');
const { User, Equipment, BorrowRequest, BorrowedItem, AuditLog, Reminder } = require('../../src/models');

jest.mock('../../src/models', () => ({
  User: { findByPk: jest.fn(), findOne: jest.fn() },
  Equipment: { findByPk: jest.fn() },
  BorrowRequest: { create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() },
  BorrowedItem: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), destroy: jest.fn() },
  AuditLog: { create: jest.fn() },
  Reminder: { create: jest.fn() }
}));

describe('BorrowService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestEquipment', () => {
    it('should create BorrowRequest and items, then log audit', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Student' });
      User.findOne.mockResolvedValue({ Role: 'Admin' });
      BorrowRequest.create.mockResolvedValue({ RequestID: 1 });
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 10 });
      BorrowedItem.create.mockResolvedValue({});
      AuditLog.create.mockResolvedValue({});

      const result = await BorrowService.requestEquipment(1, [
        { equipmentID: 10, quantity: 2 }
      ], null);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(BorrowRequest.create).toHaveBeenCalled();
      expect(BorrowedItem.create).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalled();
      expect(result.RequestID).toBe(1);
    });

    it('should throw if user is not a Student', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Admin' });
      await expect(BorrowService.requestEquipment(1, [], null))
        .rejects.toThrow('Invalid student or role');
    });
  });

  describe('approveRequest', () => {
    it('should approve a pending request and create audit log', async () => {
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 2,
        Status: 'Pending',
        save: jest.fn().mockResolvedValue(true)
      });
      BorrowedItem.findOne = jest.fn(); // or findByPk
      BorrowedItem.findOne.mockResolvedValue({ 
        RequestID: 2,
        save: jest.fn().mockResolvedValue(true)
      });
      BorrowedItem.findAll.mockResolvedValue([{ RequestID: 2 }]);
      AuditLog.create.mockResolvedValue({});

      const result = await BorrowService.approveRequest(2, new Date(), null, null, 10);
      expect(result.Status).toBe('Approved');
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw if request is not found or not pending', async () => {
      BorrowRequest.findByPk.mockResolvedValue(null);

      await expect(BorrowService.approveRequest(999, new Date(), null, null, 10))
        .rejects.toThrow('Invalid request');
    });
  });

  describe('returnEquipment', () => {
    it('should mark request as Returned, create audit log', async () => {
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 5,
        Status: 'Approved',
        save: jest.fn().mockResolvedValue(true)
      });
      AuditLog.create.mockResolvedValue({});

      const result = await BorrowService.returnEquipment(5);
      expect(result.Status).toBe('Returned');
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw if request not Approved', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 5, Status: 'Pending' });

      await expect(BorrowService.returnEquipment(5))
        .rejects.toThrow('Invalid return request');
    });
  });

  describe('sendReminderForDueReturns', () => {
    it('should send reminder for due requests', async () => {
      BorrowRequest.findAll.mockResolvedValue([
        { RequestID: 10, UserID: 1 }
      ]);
      User.findByPk.mockResolvedValue({ Email: 'student@x.com', Role: 'Student' });
      Reminder.create.mockResolvedValue({});
      AuditLog.create.mockResolvedValue({});

      const count = await BorrowService.sendReminderForDueReturns();
      expect(count).toBe(1);
      expect(AuditLog.create).toHaveBeenCalled();
    });
  });

  describe('getAllRequests', () => {
    it('should return all requests for admin', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 1 }, { RequestID: 2 }]);
      const user = { Role: 'Admin' };
      const requests = await BorrowService.getAllRequests(user);
      expect(requests.length).toBe(2);
    });

    it('should return only user requests for student', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 3 }]);
      const user = { Role: 'Student', UserID: 10 };
      const requests = await BorrowService.getAllRequests(user);
      expect(requests.length).toBe(1);
      expect(BorrowRequest.findAll).toHaveBeenCalled();
    });
  });

  describe('getPendingRequests', () => {
    it('should return all pending for admin', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 1, Status: 'Pending' }]);
      const user = { Role: 'Admin' };
      const requests = await BorrowService.getPendingRequests(user);
      expect(requests[0].Status).toBe('Pending');
    });
  });

  describe('getItemsForRequest', () => {
    it('should return items if user is admin or owner', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ UserID: 10 });
      BorrowedItem.findAll.mockResolvedValue([{ BorrowedItemID: 1 }]);

      const items = await BorrowService.getItemsForRequest({ Role: 'Admin' }, 99);
      expect(items.length).toBe(1);
    });

    it('should throw if request not found', async () => {
      BorrowRequest.findByPk.mockResolvedValue(null);
      await expect(BorrowService.getItemsForRequest({ Role: 'Admin' }, 99))
        .rejects.toThrow('Request not found');
    });
  });
});
