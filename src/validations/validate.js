const validate = (schema, property = 'body') => {
    return (req, res, next) => {
      if (!schema) return next();

      const data = property === 'params' ? req.params : req.body;
  
      const { error } = schema.validate(data);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
  
      next();
    };
  };
  
  module.exports = validate;
  