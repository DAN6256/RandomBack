// FILE: test/unit/auth.service.test.js
const AuthService = require('../../src/services/auth.service');
const { User } = require('../../src/models');
const bcrypt = require('bcrypt');

jest.mock('../../src/models', () => {
  const actualModels = jest.requireActual('../../src/models');
  return {
    ...actualModels,
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
      unscoped: jest.fn().mockReturnThis(),
      findByPk: jest.fn()
    }
  };
});

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpUser', () => {
    it('should throw error if email is already taken', async () => {
      User.findOne.mockResolvedValue({ Email: 'test@example.com' });
      await expect(AuthService.signUpUser({
        email: 'test@example.com',
        password: 'Secret123',
        name: 'Tester',
        role: 'Student'
      })).rejects.toThrow('Email already taken');
      expect(User.findOne).toHaveBeenCalledWith({ where: { Email: 'test@example.com' } });
    });

    it('should create new user if email not taken', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ UserID: 5 });
      const newUser = await AuthService.signUpUser({
        email: 'new@example.com',
        password: 'Secret123',
        name: 'NewUser',
        role: 'Admin'
      });
      expect(newUser.UserID).toBe(5);
      expect(User.create).toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should throw error if user not found', async () => {
      User.unscoped().findOne.mockResolvedValue(null);
      await expect(AuthService.loginUser({
        email: 'missing@example.com',
        password: 'Secret123'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password does not match', async () => {
      User.unscoped().findOne.mockResolvedValue({ Password: 'somehash' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(AuthService.loginUser({
        email: 'test@example.com',
        password: 'wrong'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should return token if credentials are valid', async () => {
      User.unscoped().findOne.mockResolvedValue({
        UserID: 10,
        Email: 'valid@example.com',
        Password: 'hashedstuff',
        Role: 'Student'
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const { token, user } = await AuthService.loginUser({
        email: 'valid@example.com',
        password: 'Secret123'
      });
      expect(token).toBeDefined();
      expect(user.UserID).toBe(10);
    });
  });
});
