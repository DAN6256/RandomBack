const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const validate = require('../validations/validate');
const { signupSchema, loginSchema } = require('../validations/authValidations');


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

module.exports = router;
