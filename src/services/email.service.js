const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // ✅ Fixes the certificate error
    }
});

const EmailService = {
    sendBorrowRequestNotification: async (studentEmail, adminEmail, requestID) => {
        const mailOptionsStudent = {
            from: process.env.EMAIL,
            to: studentEmail,
            subject: 'Borrow Request Submitted',
            text: `Your borrow request #${requestID} has been submitted successfully. You will be notified once it is approved.`
        };

        const mailOptionsAdmin = {
            from: process.env.EMAIL,
            to: adminEmail,
            subject: 'New Borrow Request',
            text: `A new borrow request #${requestID} has been submitted. Please review and approve it.`
        };

        await transporter.sendMail(mailOptionsStudent);
        await transporter.sendMail(mailOptionsAdmin);
    },

    sendApprovalNotification: async (studentEmail, requestID, returnDate) => {
        const mailOptions = {
            from: process.env.EMAIL,
            to: studentEmail,
            subject: 'Borrow Request Approved',
            text: `Your borrow request #${requestID} has been approved. The return deadline is ${returnDate}.`
        };

        await transporter.sendMail(mailOptions);
    },

    sendReminder: async (studentEmail, requestID, returnDate) => {
        const mailOptions = {
            from: process.env.EMAIL,
            to: studentEmail,
            subject: 'Equipment Return Reminder',
            text: `This is a reminder that your borrow request #${requestID} is due for return on ${returnDate}. Please return the item on time.`
        };

        await transporter.sendMail(mailOptions);
    }
};

module.exports = EmailService;
