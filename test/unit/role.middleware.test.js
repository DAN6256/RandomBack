const roleMiddleware = require('../../src/middlewares/role.middleware');

describe('role.middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next if role is allowed', () => {
    req.user.Role = 'Admin';
    const middleware = roleMiddleware(['Admin', 'Student']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if role is not allowed', () => {
    req.user.Role = 'Student';
    const middleware = roleMiddleware(['Admin']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient role privileges' });
    expect(next).not.toHaveBeenCalled();
  });
});
