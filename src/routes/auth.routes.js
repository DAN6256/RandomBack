
const express = require('express');
const router = express.Router();
const User = require("../models/user.model");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("../config/firebase");
const authenticateUser = require("../middlewares/auth.middleware");


const app = express();

app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

/**
 * 
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
 *               - Name
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@ashesi.edu.gh
 *               password:
 *                 type: string
 *                 example: Password123
 *               name:
 *                 type: string
 *                 example: Kwaku Asare
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
// router.post('/login', async(req, res) => {
//     res.json({ token: 'fake-jwt-token' });
// });

router.get("/user/:email", authenticateUser, async (req, res) => {
    const { email } = req.params;
  
    try {
      // Fetch user from Firebase Authentication
      const userRecord = await admin.auth().getUserByEmail(email);
  
      // Fetch user details from MySQL database
      const dbUser = await User.findOne({ where: { email } });
  
      if (!dbUser) {
        return res.status(404).json({ message: "User not found in database" });
      }
  
      res.status(200).json({
        firebaseUser: userRecord,
        dbUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error: error.message });
    }
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
 *               name:
 *                 type: string
 *                 example: Kwaku Asare
 *               role:
 *                 type: string
 *                 example: Student
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

    console.log(req.body)

    try {
          
      const userRecord = await admin.auth().createUser({
        email,
        password,
        name,
      });

      await User.create({
        Name: name,
        Email: email,
        UID: userRecord.uid,
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
