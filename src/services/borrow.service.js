const { BorrowRequest, BorrowedItem, Equipment, User, Reminder, AuditLog } = require('../models');
const EmailService = require('./email.service');

const BorrowService = {
    requestEquipment: async (userID, equipmentID, description = null, quantity, serialNumber = null) => {
        const student = await User.findByPk(userID);
        if (!student || student.Role !== 'Student') throw new Error('Invalid student');

        const admin = await User.findOne({ where: { Role: 'Admin' } });
        if (!admin) throw new Error('No admin found');

        const borrowRequest = await BorrowRequest.create({
            UserID: userID,
            BorrowDate: new Date(),
            Status: 'Pending',
            ReturnDate: null
        });

        await BorrowedItem.create({
            RequestID: borrowRequest.RequestID,
            EquipmentID: equipmentID,
            Description: description || null,
            SerialNumber: null,
            Quantity: quantity
        });

        // Log the borrowing activity
        await AuditLog.create({
            UserID: userID,
            Action: 'Borrow',
            Details: `User ${userID} requested ${quantity} units of Equipment ${equipmentID}`,
            Timestamp: new Date()
        });

        await EmailService.sendBorrowRequestNotification(student.Email, admin.Email, borrowRequest.RequestID);

        return borrowRequest;
    },

    approveRequest: async (requestID, returnDate, description = null, serialNumber = null, itemID) => {
        const request = await BorrowRequest.findByPk(requestID);
        if (!request || request.Status !== 'Pending') throw new Error('Invalid request');

        const item = await BorrowedItem.findByPk(itemID);
        if (!item) throw new Error('Invalid item ID');

        // Update only if the admin provides new values
        if (description) item.Description = description;
        if (serialNumber) item.SerialNumber = serialNumber;
        await item.save();

        request.Status = 'Approved';
        request.ReturnDate = returnDate;
        await request.save();

        const student = await User.findByPk(request.UserID);
        if (student) {
            await EmailService.sendApprovalNotification(student.Email, requestID, returnDate);
        }

        // Log approval action
        await AuditLog.create({
            UserID: request.UserID,
            Action: 'Approve',
            Details: `Admin approved borrow request #${requestID} with return date ${returnDate}`,
            Timestamp: new Date()
        });

        return request;
    },

    returnEquipment: async (requestID) => {
        const request = await BorrowRequest.findByPk(requestID);
        if (!request || request.Status !== 'Approved') throw new Error('Invalid return request');

        request.Status = 'Returned';
        await request.save();

        // Log return action
        await AuditLog.create({
            UserID: request.UserID,
            Action: 'Return',
            Details: `User ${request.UserID} returned borrow request #${requestID}`,
            Timestamp: new Date()
        });

        return request;
    },

    sendReminderForDueReturns: async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueRequests = await BorrowRequest.findAll({
            where: { Status: 'Approved', ReturnDate: tomorrow }
        });

        for (const request of dueRequests) {
            const student = await User.findByPk(request.UserID);
            if (student) {
                await EmailService.sendReminder(student.Email, request.RequestID, request.ReturnDate);
                await Reminder.create({
                    RequestID: request.RequestID,
                    ReminderDate: new Date(),
                    Sent: true
                });

                // Log reminder action
                await AuditLog.create({
                    UserID: request.UserID,
                    Action: 'Notify',
                    Details: `Reminder sent to user ${request.UserID} for return of request #${request.RequestID}`,
                    Timestamp: new Date()
                });
            }
        }
    }
};

module.exports = BorrowService;
