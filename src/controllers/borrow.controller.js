const BorrowService = require('../services/borrow.service');

const BorrowController = {
  requestEquipment: async (req, res) => {
    try {
      const userID = req.user.UserID; // from JWT
      const { items } = req.body; // array of { equipmentID, quantity, description }

      const borrowRequest = await BorrowService.requestEquipment(userID, items);
      res.status(201).json({ message: 'Request submitted', borrowRequest });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  approveRequest: async (req, res) => {
    try {
      const { requestID } = req.params;
      const { returnDate, items } = req.body; 
      // items is array of { borrowedItemID, allow, description, serialNumber }

      const approvedRequest = await BorrowService.approveRequest(requestID, returnDate, items);
      res.status(200).json({ message: 'Request approved', approvedRequest });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  returnEquipment: async (req, res) => {
    try {
      const { requestID } = req.params;
      const returnedRequest = await BorrowService.returnEquipment(requestID);
      res.status(200).json({ message: 'Equipment returned', returnedRequest });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  sendReminder: async (req, res) => {
    try {
      const count = await BorrowService.sendReminderForDueReturns();
      if (count === 0) {
        return res.status(200).json({ message: 'No due requests found to remind' });
      }
      res.status(200).json({ message: 'Reminders sent successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = BorrowController;
