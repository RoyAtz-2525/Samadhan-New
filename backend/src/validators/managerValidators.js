const { body, param } = require('express-validator');

const createAssignmentValidator = [
  body('issueId').notEmpty().withMessage('Issue ID is required').isString(),
  body('workerId').notEmpty().withMessage('Worker ID is required').isString(),
  body('rate').notEmpty().withMessage('Rate is required').isFloat({ min: 0 }),
  body('notes').optional().isString()
];

const appraisalValidator = [
  body('periodStart')
    .isISO8601().withMessage('Valid period start date is required'),
  body('periodEnd')
    .isISO8601().withMessage('Valid period end date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.periodStart)) {
        throw new Error('periodEnd must be after periodStart');
      }
      return true;
    }),
  body('overallRating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('workQualityRating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('timelinessRating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('reliabilityRating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('professionalismRating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('communicationRating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('strengths').optional({ nullable: true }).isString().trim(),
  body('areasForImprovement').optional({ nullable: true }).isString().trim(),
  body('managerComments').optional({ nullable: true }).isString().trim(),
  body('goalsAndRecommendations').optional({ nullable: true }).isString().trim()
];

module.exports = {
  createAssignmentValidator,
  appraisalValidator
};
