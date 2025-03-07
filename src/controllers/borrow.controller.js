const BorrowService = require('../services/borrow.service');

const BorrowController = {
    requestEquipment: async (req, res) => {
        try {
            const { equipmentID, quantity } = req.body;
            const borrowRequest = await BorrowService.requestEquipment(req.user.uid, equipmentID, quantity);
            res.status(201).json({ message: 'Request submitted', borrowRequest });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    approveRequest: async (req, res) => {
        try {
            const { requestID } = req.params;
            const { returnDate, Description,SerialNumber,itemID } = req.body;
            const approvedRequest = await BorrowService.approveRequest(requestID, returnDate, Description, SerialNumber, itemID);
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
            await BorrowService.sendReminderForDueReturns();
            res.status(200).json({ message: 'Reminders sent successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = BorrowController;
