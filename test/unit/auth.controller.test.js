/**
 * @file auth.controller.test.js
 * Tests for signup, login, logout, and editUser in AuthController.
 */
const AuthController = require('../../src/controllers/auth.controller');
const AuthService = require('../../src/services/auth.service');

jest.mock('../../src/services/auth.service');

describe('AuthController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should return 201 on success', async () => {
      AuthService.signUpUser.mockResolvedValue({ UserID: 100 });

      const req = {
        body: {
          email: 'test@x.com',
          password: 'secret',
          name: 'Tester',
          role: 'Student',
          major: 'CS',
          yearGroup: 2025
        }
      };
      const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await AuthController.signUp(req, res);

      expect(AuthService.signUpUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        userID: 100
      });
    });

    it('should return 400 if sign up fails', async () => {
      AuthService.signUpUser.mockRejectedValue(new Error('Email already taken'));

      const req = { body: {} };
      const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await AuthController.signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already taken' });
    });
  });

  describe('login', () => {
    it('should return 200 and token on success', async () => {
      AuthService.loginUser.mockResolvedValue({
        token: 'my-jwt',
        user: { Email: 'valid@x.com', Password: undefined }
      });

      const req = { body: { email: 'valid@x.com', password: 'secret' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await AuthController.login(req, res);

      expect(AuthService.loginUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'my-jwt',
        user: { Email: 'valid@x.com', Password: undefined } 
      });
    });

    it('should return 401 on invalid credentials', async () => {
      AuthService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });

  describe('logout', () => {
    it('should respond with 200 success', async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await AuthController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  describe('editUser', () => {
    it('should return 200 and updated user if success', async () => {
      AuthService.editUserDetails.mockResolvedValue({
        UserID: 10,
        Name: 'New Name',
        major: 'NewMajor',
        yearGroup: 2025
      });

      const req = {
        user: { UserID: 10 },
        body: { name: 'New Name', major: 'NewMajor', yearGroup: 2025 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await AuthController.editUser(req, res);

      expect(AuthService.editUserDetails).toHaveBeenCalledWith(10, {
        name: 'New Name',
        major: 'NewMajor',
        yearGroup: 2025
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User details updated successfully',
        user: {
          UserID: 10,
          Name: 'New Name',
          major: 'NewMajor',
          yearGroup: 2025
        }
      });
    });

    it('should return 400 if edit fails', async () => {
      AuthService.editUserDetails.mockRejectedValue(new Error('User not found'));

      const req = {
        user: { UserID: 99 },
        body: {}
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await AuthController.editUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
  
});
