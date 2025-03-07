//Dummy
const express = require('express');
const router = express.Router();

const admin = require("firebase-admin");
const User = require("../models/user.model");
const cors = require("cors");
const bodyParser = require("body-parser");
const serviceAccount = require("./firebase-admin.json"); //firebase admin sdk import

/**
 * @swagger
 * /api/auth/login:
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
router.post('/login', async(req, res) => {
    res.json({ token: 'fake-jwt-token' });
});

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User Signup
 *     description: Signup user and allow  them to verify email.
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
 *       201:
 *         description: Successful creation of account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/signup', async(req, res)=>{
    const { email, password, name, role } = req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        name,
      });

      await User.create({
        Name: name,
        Email: email,
        UID: name,
        Role: role
      });
  
      res.status(201).json({
        message: "User registered successfully",
        uid: userRecord.uid,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

module.exports = router;
