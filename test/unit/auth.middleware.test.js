/**
 * test/unit/auth.middleware.test.js
 *
 * Unit tests for auth.middleware.js
 */
const authenticateUser = require('../../src/middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 401 if no authorization header', () => {
    authenticateUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No authorization header provided'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', () => {
    req.headers.authorization = 'Bearer'; // missing token
    authenticateUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token format'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if jwt verification fails', () => {
    req.headers.authorization = 'Bearer someBadToken';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticateUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unauthorized'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach decoded user and call next if token is valid', () => {
    req.headers.authorization = 'Bearer goodToken';
    jwt.verify.mockReturnValue({ UserID: 123, Role: 'Admin' });

    authenticateUser(req, res, next);
    expect(req.user).toEqual({ UserID: 123, Role: 'Admin' });
    expect(next).toHaveBeenCalled();
  });
});
