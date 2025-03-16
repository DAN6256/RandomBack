/**
 * @file borrow.controller.test.js
 */
const BorrowController = require('../../src/controllers/borrow.controller');
const BorrowService = require('../../src/services/borrow.service');

jest.mock('../../src/services/borrow.service');

describe('BorrowController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestEquipment', () => {
    it('should respond 201 on success', async () => {
      BorrowService.requestEquipment.mockResolvedValue({ RequestID: 123 });

      const req = {
        body: { items: [{ equipmentID: 10, quantity: 2 }], collectionDateTime: null },
        user: { UserID: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await BorrowController.requestEquipment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Request submitted',
        borrowRequest: { RequestID: 123 }
      });
    });

    it('should respond 400 if error', async () => {
      BorrowService.requestEquipment.mockRejectedValue(new Error('some error'));

      const req = { body: {}, user: { UserID: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.requestEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'some error' });
    });
  });

  describe('approveRequest', () => {
    it('should respond 200 on success', async () => {
      BorrowService.approveRequest.mockResolvedValue({ RequestID: 2, Status: 'Approved' });

      const req = {
        params: { requestID: 2 },
        body: { returnDate: null, description: null, serialNumber: null, itemID: 10 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.approveRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Request approved',
        approvedRequest: { RequestID: 2, Status: 'Approved' }
      });
    });

    it('should respond 400 if error thrown', async () => {
      BorrowService.approveRequest.mockRejectedValue(new Error('Invalid request'));

      const req = { params: { requestID: 99 }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.approveRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid request' });
    });
  });

  describe('returnEquipment', () => {
    it('should respond 200 on success', async () => {
      BorrowService.returnEquipment.mockResolvedValue({ RequestID: 5 });

      const req = { params: { requestID: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.returnEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Equipment returned',
        returnedRequest: { RequestID: 5 }
      });
    });
  });

  describe('sendReminder', () => {
    it('should respond 200 on success', async () => {
      BorrowService.sendReminderForDueReturns.mockResolvedValue(1);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.sendReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reminders sent successfully' });
    });

    it('should respond 400 if error', async () => {
      BorrowService.sendReminderForDueReturns.mockRejectedValue(new Error('some error'));
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.sendReminder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'some error' });
    });
  });

  describe('getAllRequests', () => {
    it('should respond 200 and requests', async () => {
      BorrowService.getAllRequests.mockResolvedValue([{ RequestID: 1 }, { RequestID: 2 }]);
      const req = { user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.getAllRequests(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ requests: [{ RequestID: 1 }, { RequestID: 2 }] });
    });

    it('should respond 400 if error', async () => {
      BorrowService.getAllRequests.mockRejectedValue(new Error('some error'));
      const req = { user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.getAllRequests(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPendingRequests', () => {
    it('should respond 200 and requests', async () => {
      BorrowService.getPendingRequests.mockResolvedValue([{ RequestID: 10, Status: 'Pending' }]);
      const req = { user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.getPendingRequests(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ requests: [{ RequestID: 10, Status: 'Pending' }] });
    });
  });

  describe('getItemsForRequest', () => {
    it('should respond 200 with items', async () => {
      BorrowService.getItemsForRequest.mockResolvedValue([{ BorrowedItemID: 1 }]);
      const req = { params: { requestID: 99 }, user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.getItemsForRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ items: [{ BorrowedItemID: 1 }] });
    });

    it('should respond 404 if error thrown', async () => {
      BorrowService.getItemsForRequest.mockRejectedValue(new Error('Request not found'));
      const req = { params: { requestID: 99 }, user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await BorrowController.getItemsForRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Request not found' });
    });
  });
});
