const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../validations/validate');
const { signupSchema, loginSchema, editUserSchema } = require('../validations/authValidations');


const AuthController = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Register a new user (Student or Admin). Returns a userID upon success.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *               - major  
 *               - yearGroup
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@ashesi.edu.gh"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               role:
 *                 type: string
 *                 enum: [Student, Admin]
 *                 example: "Student"
 *              major:
 *                type: string
 *                example: "Computer Engineering"
 *              yearGroup: 
 *                type: number
 *                example: 2025
 *    
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 userID:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Bad request (e.g. email already taken)
 */
router.post(
  '/signup',
  validate(signupSchema),
  AuthController.signUp
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@ashesi.edu.gh"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhGciOiJIUzI1..."
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Bad request
 */
router.post(
  '/login',
  validate(loginSchema),
  AuthController.login
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the current user (simply instructs the client to discard the token).
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 */
router.post('/logout', authMiddleware, AuthController.logout);

/**
 * @swagger
 * /api/auth/edit:
 *   put:
 *     summary: Edit user details
 *     description: Allows logged-in users to change their name, major, or year group.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Name"
 *               major:
 *                 type: string
 *                 example: "Computer Science"
 *               yearGroup:
 *                 type: integer
 *                 example: 2025
 *     responses:
 *       200:
 *         description: User details updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User details updated successfully"
 *                 user:
 *                   type: object
 *       400:
 *         description: Error updating user
 */
router.put(
  '/edit',
  authMiddleware,              // must be logged in
  validate(editUserSchema),    // must pass name/major/yearGroup
  AuthController.editUser
);

module.exports = router;
