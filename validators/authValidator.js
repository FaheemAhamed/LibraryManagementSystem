const { body, validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('email').isEmail().withMessage('Must be a valid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResult
];

const validateLogin = [
  body('email').isEmail().withMessage('Must be a valid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResult
];

module.exports = {
  validateRegister,
  validateLogin
};
