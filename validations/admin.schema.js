const Joi = require("joi");

// Joi schema for validation
exports.signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(), // Username must be 3-30 characters
  password: Joi.string().min(8).required(), // Password must be at least 8 characters
  email: Joi.string().email().required(), // Valid email format required
  height: Joi.number().optional(), // Optional numeric field
  weight: Joi.number().optional(), // Optional numeric field
});

exports.resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(), // Valid email format required
  newPassword: Joi.string().min(8).required(), // Password must be at least 8 characters
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(), // Valid email format required
});
