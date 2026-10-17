const Joi = require('joi');
const { HttpError } = require('../utils/helpers');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const err = new HttpError(400, 'Validation failed');
    err.details = error.details.map((d) => d.message);
    return next(err);
  }
  req.body = value;
  next();
};

const patientSchema = (isCreate) => {
  const f = (s) => (isCreate ? s.required() : s);
  const schema = Joi.object({
    name: f(Joi.string().trim().min(2).max(100)),
    age: f(Joi.number().integer().min(0).max(150)),
    gender: f(Joi.string().valid('male', 'female', 'other')),
    phone: Joi.string().trim().max(20).allow('', null),
    address: Joi.string().trim().allow('', null),
    medicalHistory: Joi.string().trim().allow('', null),
  });
  return isCreate ? schema : schema.min(1);
};

const doctorSchema = (isCreate) => {
  const f = (s) => (isCreate ? s.required() : s);
  const schema = Joi.object({
    name: f(Joi.string().trim().min(2).max(100)),
    specialization: f(Joi.string().trim().min(2).max(100)),
    email: Joi.string().trim().email().allow('', null),
    phone: Joi.string().trim().max(20).allow('', null),
    experienceYears: Joi.number().integer().min(0).max(80).allow(null),
  });
  return isCreate ? schema : schema.min(1);
};

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const mappingSchema = Joi.object({
  patientId: Joi.number().integer().positive().required(),
  doctorId: Joi.number().integer().positive().required(),
});

module.exports = {
  validate,
  patientSchema,
  doctorSchema,
  registerSchema,
  loginSchema,
  mappingSchema,
};
