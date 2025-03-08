const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authMiddleware = require('../middlewares/auth.middleware'); // If you need it, though probably not for /signup /login
const roleMiddleware = require('../middlewares/role.middleware'); // Possibly not used here
const validate = require('../validations/validate');
const { signupSchema, loginSchema } = require('../validations/authValidations');

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
router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const existing = await User.findOne({ where: { Email: email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      Name: name,
      Email: email,
      Role: role,
      Password: hashedPassword
    });

    return res.status(201).json({
      message: 'User registered successfully',
      userID: newUser.UserID
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

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
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        UserID: user.UserID,
        Email: user.Email,
        Role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '60m' } // or '1h'
    );

    return res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
