const { body } = require('express-validator');

const reviewIssueValidator = [
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['UNDER_REVIEW', 'APPROVE', 'REJECT']).withMessage('Invalid action'),
  body('reason')
    .if(body('action').equals('REJECT'))
    .notEmpty().withMessage('Reason is required when rejecting an issue')
    .isString(),
  body('reason')
    .if(body('action').not().equals('REJECT'))
    .optional().isString()
];

const updatePriorityValidator = [
  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority')
];

module.exports = {
  reviewIssueValidator,
  updatePriorityValidator
};
