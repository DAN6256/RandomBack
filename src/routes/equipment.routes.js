const express = require('express');
const EquipmentController = require('../controllers/equipment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const validate = require('../validations/validate');
const {
  createEquipmentSchema,
  updateEquipmentSchema
} = require('../validations/equipmentValidations');

const router = express.Router();

/**
 * @swagger
 * /api/equipment:
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
 *         description: Equipment added successfully
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
 *         description: Invalid request data
 *       403:
 *         description: Unauthorized - User is not an admin
 */
router.post('/', authMiddleware, roleMiddleware(['Admin']),validate(createEquipmentSchema), EquipmentController.addEquipment);

/**
 * @swagger
 * /api/equipment/{equipmentID}:
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
 *         description: The ID of the equipment to update
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
 *     responses:
 *       200:
 *         description: Equipment updated successfully
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
 *         description: Invalid request data or equipment not found
 *       403:
 *         description: Unauthorized - User is not an admin
 */
router.put('/:equipmentID', authMiddleware, roleMiddleware(['Admin']),validate(updateEquipmentSchema), EquipmentController.updateEquipment);

/**
 * @swagger
 * /api/equipment/{equipmentID}:
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
 *         description: The ID of the equipment to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Equipment deleted successfully"
 *       400:
 *         description: Invalid request or item not found
 *       403:
 *         description: Unauthorized - User is not an admin
 */
router.delete('/:equipmentID', authMiddleware, roleMiddleware(['Admin']), EquipmentController.deleteEquipment);

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: Get all equipment
 *     description: Retrieve a list of all equipment in the system
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all equipment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 equipmentList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       EquipmentID:
 *                         type: integer
 *                         example: 1
 *                       Name:
 *                         type: string
 *                         example: "3D Printer"
 *       400:
 *         description: Error retrieving equipment
 */
router.get('/', authMiddleware, EquipmentController.getAllEquipment);

/**
 * @swagger
 * /api/equipment/{equipmentID}:
 *   get:
 *     summary: Get specific equipment details
 *     description: Retrieve details of a specific equipment item by ID.
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: equipmentID
 *         in: path
 *         required: true
 *         description: The ID of the equipment to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 equipment:
 *                   type: object
 *       404:
 *         description: Equipment not found
 */
router.get('/:equipmentID', authMiddleware, EquipmentController.getEquipmentById);

module.exports = router;
