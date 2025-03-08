const validate = (schema) => {
    return (req, res, next) => {
      if (!schema) return next();
  
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
  
      next();
    };
  };
  
  module.exports = validate;
  