const Joi = require('joi');

const createEquipmentSchema = Joi.object({
  name: Joi.string().required()
});

const updateEquipmentSchema = Joi.object({
  name: Joi.string().required()
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema
};
