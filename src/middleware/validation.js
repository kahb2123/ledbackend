const { body, validationResult } = require('express-validator');

// Simple validation middleware that doesn't use express-validator arrays
const validateOrder = (req, res, next) => {
  console.log('🔍 Validating order...');
  const errors = [];

  // Check required fields
  if (!req.body.ledType) errors.push('LED type is required');
  if (!req.body.ledCategory) errors.push('LED category is required');
  if (!req.body.squareMeters) errors.push('Square meters is required');
  if (!req.body.programType) errors.push('Program type is required');
  if (!req.body.programDate) errors.push('Program date is required');
  if (!req.body.duration?.days) errors.push('Duration days is required');
  if (!req.body.location?.venue) errors.push('Venue is required');
  if (!req.body.location?.city) errors.push('City is required');

  // Validate values
  if (req.body.squareMeters && req.body.squareMeters < 1) {
    errors.push('Square meters must be at least 1');
  }
  
  if (req.body.duration?.days && req.body.duration.days < 1) {
    errors.push('Duration must be at least 1 day');
  }

  if (errors.length > 0) {
    console.log('❌ Validation errors:', errors);
    return res.status(400).json({ errors });
  }

  console.log('✅ Validation passed');
  next();
};

// Simple task validation
const validateTask = (req, res, next) => {
  const errors = [];
  
  if (!req.body.title) errors.push('Title is required');
  if (!req.body.description) errors.push('Description is required');
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Simple user validation
const validateUser = (req, res, next) => {
  const errors = [];
  
  if (!req.body.email) errors.push('Email is required');
  if (req.body.email && !req.body.email.includes('@')) {
    errors.push('Invalid email format');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = {
  validateOrder,
  validateTask,
  validateUser
};