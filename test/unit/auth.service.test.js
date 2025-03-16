/**
 * @file auth.service.test.js
 * Unit tests for AuthService, excluding forgot/reset password methods as requested.
 */
const AuthService = require('../../src/services/auth.service');
const { User } = require('../../src/models');
const bcrypt = require('bcrypt'); // We'll mock compare, hash if needed

jest.mock('../../src/models', () => {
  return {
    User: {
      unscoped: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn()
    }
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpUser', () => {
    it('should create a new user if email is not taken', async () => {
      User.findOne.mockResolvedValue(null); // no user with that email
      User.create.mockResolvedValue({ UserID: 123, Email: 'test@x.com' });
      bcrypt.hash.mockResolvedValue('hashedPassword');

      const newUser = await AuthService.signUpUser({
        email: 'test@x.com',
        password: 'password',
        name: 'Tester',
        role: 'Student',
        major: 'CS',
        yearGroup: 2025
      });

      expect(User.findOne).toHaveBeenCalledWith({ where: { Email: 'test@x.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User.create).toHaveBeenCalled();
      expect(newUser.UserID).toBe(123);
    });

    it('should throw error if email already taken', async () => {
      User.findOne.mockResolvedValue({ Email: 'test@x.com' });

      await expect(AuthService.signUpUser({
        email: 'test@x.com',
        password: 'password',
        name: 'Tester',
        role: 'Student',
        major: 'CS',
        yearGroup: 2025
      })).rejects.toThrow('Email already taken');
    });
  });

  describe('loginUser', () => {
    it('should throw error if user not found', async () => {
      User.unscoped().findOne.mockResolvedValue(null);

      await expect(AuthService.loginUser({
        email: 'none@x.com',
        password: 'secret'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password mismatch', async () => {
      User.unscoped().findOne.mockResolvedValue({ Email: 'valid@x.com', Password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(AuthService.loginUser({
        email: 'valid@x.com',
        password: 'wrong'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should return token and user if login success', async () => {
      User.unscoped().findOne.mockResolvedValue({
        UserID: 10, 
        Email: 'valid@x.com', 
        Password: 'hashed', 
        Role: 'Student'
      });
      bcrypt.compare.mockResolvedValue(true);

      const { token, user } = await AuthService.loginUser({
        email: 'valid@x.com',
        password: 'secret'
      });

      expect(token).toBeDefined();
      expect(user.Email).toBe('valid@x.com');
      expect(user.Password).toBeUndefined();
    });
  });

  describe('editUserDetails', () => {
    it('should update user fields if user exists', async () => {
      User.unscoped().findByPk.mockResolvedValue({
        UserID: 20,
        Name: 'Old Name',
        major: 'OldMajor',
        yearGroup: 2020,
        save: jest.fn().mockResolvedValue(true)
      });

      const updated = await AuthService.editUserDetails(20, {
        name: 'New Name',
        major: 'NewMajor',
        yearGroup: 2025
      });

      expect(updated.Name).toBe('New Name');
      expect(updated.major).toBe('NewMajor');
      expect(updated.yearGroup).toBe(2025);
    });

    it('should throw error if user not found', async () => {
      User.unscoped().findByPk.mockResolvedValue(null);

      await expect(AuthService.editUserDetails(99, {
        name: 'Any', major: 'CS', yearGroup: 2025
      })).rejects.toThrow('User not found');
    });
  });

});
