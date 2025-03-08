const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user.Role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient role privileges' });
      }
      next();
    };
  };
  
  module.exports = roleMiddleware;
  