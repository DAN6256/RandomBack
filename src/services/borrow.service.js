const { BorrowRequest, BorrowedItem, Equipment, User, Reminder, AuditLog } = require('../models');
const EmailService = require('./email.service');

const BorrowService = {
  requestEquipment: async (userID, items, collectionDateTime) => {
    const student = await User.findByPk(userID);
    if (!student || student.Role !== 'Student') {
      throw new Error('Invalid student or role');
    }

    const admin = await User.findOne({ where: { Role: 'Admin' } });
    if (!admin) {
      throw new Error('No admin found');
    }

    // Create a new BorrowRequest record
    const borrowRequest = await BorrowRequest.create({
      UserID: userID,
      BorrowDate: new Date(),
      Status: 'Pending',
      ReturnDate: null,
      CollectionDateTime: collectionDateTime
    });

    // Create the BorrowedItems
    for (const item of items) {
      // Validate equipment
      const equip = await Equipment.findByPk(item.equipmentID);
      if (!equip) {
        throw new Error(`Equipment not found: ID=${item.equipmentID}`);
      }
      await BorrowedItem.create({
        RequestID: borrowRequest.RequestID,
        EquipmentID: item.equipmentID,
        Description: item.description || null,
        SerialNumber: null, // Student doesn't provide
        Quantity: item.quantity
      });
    }

    // Audit log
    await AuditLog.create({
      UserID: userID,
      Action: 'Borrow',
      RequestID: borrowRequest.RequestID,
      Details: `User ${userID} requested multiple items`,
      Timestamp: new Date()
    });

    // Now fetch the entire list of borrowed items with their equipment details
    const borrowedItems = await BorrowedItem.findAll({
      where: { RequestID: borrowRequest.RequestID },
      include: [
        { model: Equipment } // so we can get equipment name
      ]
    });

    // Send email to student + admin, now with item details
    await EmailService.sendBorrowRequestNotification(
      student.Name,                
      student.Email,
      admin.Email,
      borrowRequest.RequestID,
      borrowedItems,
      borrowRequest.CollectionDateTime
    );

    return borrowRequest;
  },

  approveRequest: async (requestID, returnDate, items) => {
    const request = await BorrowRequest.findByPk(requestID);
    if (!request || request.Status !== 'Pending') {
      throw new Error('Request not found or already processed');
    }

    // Process the allow/deny for each item
    for (const itemData of items) {
      const { borrowedItemID, allow, description, serialNumber } = itemData;

      const borrowedItem = await BorrowedItem.findByPk(borrowedItemID);
      if (!borrowedItem || borrowedItem.RequestID != requestID) {
        throw new Error(`BorrowedItem not found: ID=${borrowedItemID}`);
      }

      if (allow === false) {
        await borrowedItem.destroy();
      } else {
        if (description) borrowedItem.Description = description;
        if (serialNumber) borrowedItem.SerialNumber = serialNumber;
        await borrowedItem.save();
      }
    }

    // Check what's left
    const remainingItems = await BorrowedItem.findAll({ where: { RequestID: requestID } });
    if (remainingItems.length === 0) {
      // If no items remain, effectively "cancel" the request or treat as "Returned"
      request.Status = 'Returned';
    } else {
      request.Status = 'Approved';
      request.ReturnDate = returnDate;
    }
    await request.save();

    // Notify student
    const student = await User.findByPk(request.UserID);

    // We want item details again. Now that we've pruned or updated them, fetch them w/Equipment
    const updatedItems = await BorrowedItem.findAll({
      where: { RequestID: requestID },
      include: [
        { model: Equipment }
      ]
    });

    if (student) {
      await EmailService.sendApprovalNotification(
        student.Name,
        student.Email,
        requestID,
        returnDate,
        updatedItems // pass the final items
      );
    }

    // Audit log
    await AuditLog.create({
      UserID: request.UserID,
      RequestID: requestID,
      Action: 'Approve',
      Details: `Admin approved request #${requestID}, ReturnDate: ${returnDate}`,
      Timestamp: new Date()
    });

    return request;
  },

  returnEquipment: async (requestID) => {
    const request = await BorrowRequest.findByPk(requestID);
    if (!request || request.Status !== 'Approved') {
      throw new Error('Invalid request or not in approved state');
    }

    request.Status = 'Returned';
    await request.save();

    // Audit log
    await AuditLog.create({
      UserID: request.UserID,
      RequestID: requestID,
      Action: 'Return',
      Details: `User ${request.UserID} returned request #${requestID}`,
      Timestamp: new Date()
    });

    return request;
  },

  sendReminderForDueReturns: async () => {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const dueRequests = await BorrowRequest.findAll({
      where: {
        Status: 'Approved',
        ReturnDate: twoDaysFromNow
      }
    });

    let remindersSent = 0;

    for (const request of dueRequests) {
      const student = await User.findByPk(request.UserID);
      if (student) {
        await EmailService.sendReminder(student.Name, student.Email, request.RequestID, request.ReturnDate);
        await Reminder.create({
          RequestID: request.RequestID,
          ReminderDate: new Date(),
          Sent: true
        });

        await AuditLog.create({
          UserID: request.UserID,
          RequestID: request.RequestID,
          Action: 'Notify',
          Details: `Reminder sent to user ${request.UserID} for request #${request.RequestID}`,
          Timestamp: new Date()
        });

        remindersSent++;
      }
    }

    return remindersSent;
  },

  getAllRequests: async (user) => {
    if (user.Role === 'Admin') {
      // Admin sees all requests
      return await BorrowRequest.findAll({
        order: [['RequestID', 'DESC']],
        include: [User] // optionally include user details
      });
    } else {
      // Student sees only their requests
      return await BorrowRequest.findAll({
        where: { UserID: user.UserID },
        order: [['RequestID', 'DESC']],
        include: [User]
      });
    }
  },

  getPendingRequests: async (user) => {
    if (user.Role === 'Admin') {
      return await BorrowRequest.findAll({
        where: { Status: 'Pending' },
        order: [['RequestID', 'DESC']],
        include: [User]
      });
    } else {
      return await BorrowRequest.findAll({
        where: {
          UserID: user.UserID,
          Status: 'Pending'
        },
        order: [['RequestID', 'DESC']],
        include: [User]
      });
    }
  }



};

module.exports = BorrowService;
