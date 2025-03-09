/**
 * test/unit/role.middleware.test.js
 *
 * Unit tests for roleMiddleware.
 */
const roleMiddleware = require('../../src/middlewares/role.middleware');

describe('roleMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: {} }; // we'll set user props
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next if user role is in allowedRoles', () => {
    req.user.Role = 'Admin';
    const mw = roleMiddleware(['Admin', 'SuperAdmin']);
    mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not allowed', () => {
    req.user.Role = 'Student';
    const mw = roleMiddleware(['Admin']);
    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: Insufficient role privileges'
    });
  });
});
