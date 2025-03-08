const BorrowController = require('../../src/controllers/borrow.controller');
const BorrowService = require('../../src/services/borrow.service');

jest.mock('../../src/services/borrow.service');

describe('BorrowController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('requestEquipment', () => {
    it('should return 201 and the borrowRequest if successful', async () => {
      req.body.items = [{ equipmentID: 5, quantity: 2 }];
      req.user.UserID = 1;

      // Mock service
      BorrowService.requestEquipment.mockResolvedValueOnce({ RequestID: 100 });
      
      await BorrowController.requestEquipment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Request submitted',
        borrowRequest: { RequestID: 100 }
      });
    });

    it('should return 400 if service throws error', async () => {
      BorrowService.requestEquipment.mockRejectedValueOnce(new Error('Boom!'));

      await BorrowController.requestEquipment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Boom!' });
    });
  });
});
