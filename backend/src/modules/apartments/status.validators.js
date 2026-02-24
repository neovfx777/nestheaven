// /backend/src/modules/apartments/status.validators.js
const Joi = require('joi');

exports.validateStatusChange = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('active', 'hidden').required(),
    reason: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

exports.validateMarkSold = (req, res, next) => {
  const schema = Joi.object({
    soldPrice: Joi.number().positive().optional(),
    soldDate: Joi.date().iso().optional(),
    notes: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

exports.validateBulkStatus = (req, res, next) => {
  const schema = Joi.object({
    apartmentIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    status: Joi.string().valid('active', 'hidden', 'sold').optional(),
    reason: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

exports.validateGetHistory = (req, res, next) => {
  const paramsSchema = Joi.object({
    apartmentId: Joi.string().uuid().required(),
  });

  const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  });

  const paramsError = paramsSchema.validate(req.params).error;
  const queryError = querySchema.validate(req.query).error;

  if (paramsError) {
    return res.status(400).json({ error: paramsError.details[0].message });
  }
  if (queryError) {
    return res.status(400).json({ error: queryError.details[0].message });
  }
  next();
};