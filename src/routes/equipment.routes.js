const express = require('express');
const EquipmentController = require('../controllers/equipment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /equipment/:
 *   post:
 *     summary: Add new equipment (Admin only)
 *     description: Admins can add new equipment to the system.
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "3D Printer"
 *     responses:
 *       201:
 *         description: Equipment added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Equipment added successfully"
 *                 equipment:
 *                   type: object
 *       400:
 *         description: Invalid request data.
 *       403:
 *         description: Unauthorized - User is not an admin.
 */
router.post('/', authMiddleware, roleMiddleware(['Admin']), EquipmentController.addEquipment);

/**
 * @swagger
 * /equipment/{equipmentID}:
 *   put:
 *     summary: Update equipment details (Admin only)
 *     description: Admins can update existing equipment details.
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: equipmentID
 *         in: path
 *         required: true
 *         description: The ID of the equipment to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated 3D Printer"
 *               description:
 *                 type: string
 *                 example: "Updated description for the 3D printer."
 *               serialNumber:
 *                 type: string
 *                 example: "PRT-2024-XYZ-UPDATED"
 *     responses:
 *       200:
 *         description: Equipment updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Equipment updated successfully"
 *                 updatedEquipment:
 *                   type: object
 *       400:
 *         description: Invalid request data or equipment not found.
 *       403:
 *         description: Unauthorized - User is not an admin.
 */
router.put('/:equipmentID', authMiddleware, roleMiddleware(['Admin']), EquipmentController.updateEquipment);

/**
 * @swagger
 * /equipment/{equipmentID}:
 *   delete:
 *     summary: Delete equipment (Admin only)
 *     description: Admins can delete equipment from the system.
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: equipmentID
 *         in: path
 *         required: true
 *         description: The ID of the equipment to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Equipment deleted successfully"
 *       404:
 *         description: Equipment not found.
 *       403:
 *         description: Unauthorized - User is not an admin.
 */
router.delete('/:equipmentID', authMiddleware, roleMiddleware(['Admin']), EquipmentController.deleteEquipment);

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get all equipment
 *     description: Retrieve a list of all equipment in the system.
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all equipment.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       403:
 *         description: Unauthorized access.
 */
router.get('/', authMiddleware, EquipmentController.getAllEquipment);

/**
 * @swagger
 * /equipment/{equipmentID}:
 *   get:
 *     summary: Get specific equipment details
 *     description: Retrieve details of a specific equipment item.
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: equipmentID
 *         in: path
 *         required: true
 *         description: The ID of the equipment to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Equipment not found.
 *       403:
 *         description: Unauthorized access.
 */
router.get('/:equipmentID', authMiddleware, EquipmentController.getEquipmentById);

module.exports = router;
