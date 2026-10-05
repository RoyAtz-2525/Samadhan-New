const { body } = require('express-validator');

const respondAssignmentValidator = [
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['ACCEPT', 'REJECT']).withMessage('Action must be ACCEPT or REJECT'),
  body('reason')
    .if(body('action').equals('REJECT'))
    .notEmpty().withMessage('Reason is required when rejecting an assignment')
    .isString()
];

const workProgressValidator = [
  body('note')
    .optional()
    .isString().withMessage('Note must be a string')
    .trim()
];

const workCompleteValidator = [
  body('note')
    .notEmpty().withMessage('Completion note is required')
    .isString().withMessage('Note must be a string')
    .trim()
];

module.exports = {
  respondAssignmentValidator,
  workProgressValidator,
  workCompleteValidator
};
