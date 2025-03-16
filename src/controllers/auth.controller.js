
const AuthService = require('../services/auth.service');

const AuthController = {
  /**
   * POST /signup
   */
  signUp: async (req, res) => {
    try {
      const { email, password, name, role, major, yearGroup } = req.body;
      const newUser = await AuthService.signUpUser({ email, password, name, role, major, yearGroup });
      
      // Return success
      return res.status(201).json({
        message: 'User registered successfully',
        userID: newUser.UserID
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * POST /login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await AuthService.loginUser({ email, password });

      return res.status(200).json({
        message: 'Login successful',
        token
        // We do NOT return the password. Possibly we can return user info if needed.
      });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      // For now, we just rely on the client to discard their token.
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  editUser: async (req, res) => {
    try {
      // The user is guaranteed to be auth'd by middleware
      // So we get userID from req.user
      const userID = req.user.UserID;
      const { name, major, yearGroup } = req.body;

      const updatedUser = await AuthService.editUserDetails(userID, { name, major, yearGroup });

      // Return the updated user details (excluding password)
      return res.status(200).json({
        message: 'User details updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  
};

module.exports = AuthController;
