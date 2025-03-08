const authenticateUser = require('../../src/middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

describe('auth.middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: { authorization: 'Bearer fake_token' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next if token is valid', () => {
    jwt.verify.mockReturnValue({ UserID: 1, Role: 'Student' });

    authenticateUser(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('fake_token', process.env.JWT_SECRET);
    expect(req.user).toEqual({ UserID: 1, Role: 'Student' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no auth header', () => {
    req.headers = {};
    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No authorization header provided' });
  });

  it('should return 401 if token is invalid', () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
      error: 'invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
