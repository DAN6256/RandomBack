//Dummy
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return a JWT token.
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
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@ashesi.edu.gh
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/login', (req, res) => {
    res.json({ token: 'fake-jwt-token' });
});

module.exports = router;
