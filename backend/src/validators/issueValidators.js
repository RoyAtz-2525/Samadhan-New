const { body } = require('express-validator');

const createIssueValidator = [
  body('categoryId').notEmpty().withMessage('Category is required').isString(),
  body('title').notEmpty().withMessage('Title is required').isString().isLength({ max: 255 }),
  body('description').notEmpty().withMessage('Description is required').isString(),
  body('latitude').notEmpty().withMessage('Location is required. Please use your current location.').isFloat(),
  body('longitude').notEmpty().withMessage('Location is required. Please use your current location.').isFloat(),
  body('address').optional().isString(),
];

module.exports = {
  createIssueValidator
};
