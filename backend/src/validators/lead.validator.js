const Joi = require('joi');

const createLeadSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string().trim().min(7).max(20).required(),
  company: Joi.string().trim().max(150).required(),
  status: Joi.string()
    .valid('New', 'Contacted', 'Qualified', 'Converted', 'Lost')
    .default('New'),
  notes: Joi.string().trim().max(1000).allow('').optional(),
});

const updateLeadSchema = createLeadSchema.fork(
  ['name', 'email', 'phone', 'company'],
  (field) => field.optional()
);

const statusSchema = Joi.object({
  status: Joi.string().trim()
    .valid('New', 'Contacted', 'Qualified', 'Converted', 'Lost')
    .required(),
});

module.exports = { createLeadSchema, updateLeadSchema, statusSchema };
