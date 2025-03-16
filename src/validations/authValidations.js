const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  // Must be 'Student' or 'Admin'
  role: Joi.string().valid('Student', 'Admin').required(),
  major: Joi.string().required(),     
  yearGroup: Joi.number().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const editUserSchema = Joi.object({
  name: Joi.string().optional(),
  major: Joi.string().optional(),
  yearGroup: Joi.number().optional()
}).min(1); 

module.exports = {
  signupSchema,
  loginSchema
};
