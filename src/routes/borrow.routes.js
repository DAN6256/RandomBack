const express = require('express');
const BorrowController = require('../controllers/borrow.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/borrow/request:
 *   post:
 *     summary: Request equipment (Student only)
 *     description: Students can request to borrow equipment. Both the student and the admin will receive email notifications.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipmentID
 *               - quantity
 *             properties:
 *               equipmentID:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               description:
 *                 type: string
 *                 example: "Need this for a robotics project."
 *               serialNumber:
 *                 type: string
 *                 example: "ABC1234"
 *     responses:
 *       201:
 *         description: Borrow request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request submitted"
 *                 borrowRequest:
 *                   type: object
 *       400:
 *         description: Invalid request data or equipment not found.
 *       403:
 *         description: Unauthorized - User is not a student.
 */
router.post('/request', authMiddleware, roleMiddleware(['Student']), BorrowController.requestEquipment);

/**
 * @swagger
 * /api/borrow/approve/{requestID}:
 *   put:
 *     summary: Approve a borrow request (Admin only)
 *     description: Admins can approve a pending borrow request. The student will receive a confirmation email with the return deadline. The admin can also edit or add the description and serial number.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestID
 *         in: path
 *         required: true
 *         description: The ID of the borrow request to approve.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - returnDate
 *               - itemID
 *             properties:
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-20T00:00:00Z"
 *               itemID:
 *                 type: integer
 *                 example: 5
 *               description:
 *                 type: string
 *                 example: "Updated description: Advanced motor component."
 *               serialNumber:
 *                 type: string
 *                 example: "XYZ5678"
 *     responses:
 *       200:
 *         description: Borrow request approved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request approved"
 *                 approvedRequest:
 *                   type: object
 *       400:
 *         description: Request not found, invalid itemID, or already processed.
 *       403:
 *         description: Unauthorized - User is not an admin.
 */
router.put('/approve/:requestID', authMiddleware, roleMiddleware(['Admin']), BorrowController.approveRequest);

/**
 * @swagger
 * /api/borrow/return/{requestID}:
 *   put:
 *     summary: Return borrowed equipment (Admin only)
 *     description: Admins can mark a borrow request as returned.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestID
 *         in: path
 *         required: true
 *         description: The ID of the borrow request to mark as returned.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Equipment returned"
 *                 returnedRequest:
 *                   type: object
 *       400:
 *         description: Invalid return request.
 *       403:
 *         description: Unauthorized - User is not an admin.
 */
router.put('/return/:requestID', authMiddleware, roleMiddleware(['Admin']), BorrowController.returnEquipment);

/**
 * @swagger
 * /api/borrow/send-reminder:
 *   post:
 *     summary: Send return reminders (Admin only)
 *     description: Admins can trigger email reminders for students who have not returned borrowed equipment one day before the due date.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminders sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reminders sent successfully"
 *       400:
 *         description: Error processing reminders.
 *       403:
 *         description: Unauthorized - User is not an admin.
 */
router.post('/send-reminder', authMiddleware, roleMiddleware(['Admin']), BorrowController.sendReminder);

module.exports = router;
