const { body, validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => err.msg).join(', ');
    const error = new Error(errorMsg);
    error.statusCode = 400;
    return next(error);
  }
  next();
};

const validateBookAdd = [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('author').notEmpty().trim().withMessage('Author is required'),
  body('isbn').notEmpty().trim().withMessage('ISBN is required'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity cannot be negative'),
  validateResult
];

const validateBookUpdate = [
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty if provided'),
  body('author').optional().notEmpty().trim().withMessage('Author cannot be empty if provided'),
  body('isbn').optional().notEmpty().trim().withMessage('ISBN cannot be empty if provided'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity cannot be negative'),
  validateResult
];

module.exports = {
  validateBookAdd,
  validateBookUpdate
};
