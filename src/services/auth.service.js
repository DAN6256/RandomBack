
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // to create/find users
require('dotenv').config();

// Service-level functions for signup and login
const AuthService = {
  /**
   * Create a new user (Student or Admin).
   * Throws an error if email already in use.
   */
  signUpUser: async ({ email, password, name, role }) => {
    // Check if user already exists
    const existing = await User.findOne({ where: { Email: email } });
    if (existing) {
      throw new Error('Email already taken');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      Name: name,
      Email: email,
      Role: role,
      Password: hashedPassword,
      major,     
      yearGroup 
    });

    return newUser; // The controller can shape the response
  },

  /**
   * Validate credentials and return JWT if valid.
   * Throws errors if user not found or password mismatch.
   */
  loginUser: async ({ email, password }) => {
    // Use unscoped to get the password
    const user = await User.unscoped().findOne({ where: { Email: email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      throw new Error('Invalid credentials');
    }
    

    // Generate token
    const token = jwt.sign(
      {
        UserID: user.UserID,
        Email: user.Email,
        Role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '60m' } // or '1h'
    );

    user.Password = undefined;

    return { token, user };
  },

  editUserDetails: async (userID, { name, major, yearGroup }) => {
    // find user by ID
    const user = await User.unscoped().findByPk(userID);
    if (!user) {
      throw new Error('User not found');
    }

    // Update only the fields provided
    if (name !== undefined) user.Name = name;
    if (major !== undefined) user.major = major;
    if (yearGroup !== undefined) user.yearGroup = yearGroup;

    await user.save();

    return user; // Return the updated user (password excluded by default scope)
  }
};

module.exports = AuthService;
