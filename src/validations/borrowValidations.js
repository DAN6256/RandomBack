const Joi = require('joi');

// For student borrow requests: array of items with equipmentID, quantity, description
const requestBorrowSchema = Joi.object({
  collectionDateTime: Joi.date().required(),
  items: Joi.array().items(
    Joi.object({
      equipmentID: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
      description: Joi.string().optional()
    })
  ).min(1).required()
});

// For admin approval: array of items with borrowedItemID, allow, optional description, serialNumber
const approveBorrowSchema = Joi.object({
  returnDate: Joi.date().required(),
  items: Joi.array().items(
    Joi.object({
      borrowedItemID: Joi.number().integer().required(),
      allow: Joi.boolean().required(),
      description: Joi.string().optional(),
      serialNumber: Joi.string().optional()
    })
  ).min(1).required()
});

module.exports = {
  requestBorrowSchema,
  approveBorrowSchema
};
