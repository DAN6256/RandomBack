
const AuthService = require('../services/auth.service');

const AuthController = {
  /**
   * POST /signup
   */
  signUp: async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      const newUser = await AuthService.signUpUser({ email, password, name, role });
      
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
  }
};

module.exports = AuthController;
