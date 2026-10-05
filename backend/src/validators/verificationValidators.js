const { body, param } = require('express-validator');

const submitBeforeVerificationValidator = [
  param('assignmentId').isUUID().withMessage('Invalid assignment ID format'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180'),
  body('siteCondition').optional().isString().trim().isLength({ max: 500 }),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
];

const reviewVerificationValidator = [
  param('verificationId').isUUID().withMessage('Invalid verification ID format'),
  body('action').isIn(['APPROVE', 'REJECT', 'REVISION_REQUESTED']).withMessage('Action must be APPROVE, REJECT, or REVISION_REQUESTED'),
  body('reason').if(body('action').isIn(['REJECT', 'REVISION_REQUESTED'])).notEmpty().withMessage('Reason is required for REJECT and REVISION_REQUESTED').isString().trim().isLength({ max: 1000 }),
];

const submitAfterVerificationValidator = [
  param('assignmentId').isUUID().withMessage('Invalid assignment ID format'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180'),
  body('workSummary').notEmpty().withMessage('Work summary is required').isString().trim().isLength({ max: 2000 }),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
];

module.exports = {
  submitBeforeVerificationValidator,
  submitAfterVerificationValidator,
  reviewVerificationValidator
};
