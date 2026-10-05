const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { submitBeforeVerificationValidator } = require('../validators/verificationValidators');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(requireAuth);
router.use(requireRole('WORKER'));

// Get before-work verification status/details
router.get('/before/:assignmentId', verificationController.getBeforeVerification);

// Submit before-work verification
router.post('/before/:assignmentId', 
  upload.array('media', 5),
  submitBeforeVerificationValidator, 
  verificationController.submitBeforeVerification
);
// Get after-work verification status/details
router.get('/after/:assignmentId', verificationController.getAfterVerification);

// Submit after-work verification
router.post('/after/:assignmentId', 
  upload.array('media', 5),
  require('../validators/verificationValidators').submitAfterVerificationValidator, 
  verificationController.submitAfterVerification
);

module.exports = router;
