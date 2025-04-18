const BorrowService = require('../services/borrow.service');

const BorrowController = {
  requestEquipment: async (req, res) => {
    try {
      const { items, collectionDateTime } = req.body; 
      const userID = req.user.UserID;

      const borrowRequest = await BorrowService.requestEquipment(userID, items, collectionDateTime);
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
        return res.status(200).json({ message: count });
      }
      res.status(200).json({ message: 'Reminders sent successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAllRequests: async (req, res) => {
    try {
      const user = req.user; 
      const requests = await BorrowService.getAllRequests(user);
      res.status(200).json({ requests });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getPendingRequests: async (req, res) => {
    try {
      const user = req.user;
      const requests = await BorrowService.getPendingRequests(user);
      res.status(200).json({ requests });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getItemsForRequest: async (req, res) => {
    try {
      const { requestID } = req.params;
      const user = req.user; 
      const items = await BorrowService.getItemsForRequest(user, requestID);
      res.status(200).json({ items });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },
  getAllLogs: async (req, res) => {
      try {
        const logs = await BorrowService.getAllLogs();
        res.status(200).json({ logs });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
};

module.exports = BorrowController;
