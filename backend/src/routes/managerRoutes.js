const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const verificationController = require('../controllers/verificationController');
const { createAssignmentValidator, appraisalValidator } = require('../validators/managerValidators');
const { reviewVerificationValidator } = require('../validators/verificationValidators');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);
router.use(requireRole('MANAGER'));

router.get('/dashboard', managerController.getDashboard);
router.get('/issues/approved', managerController.getApprovedIssues);
router.get('/issues/:id', managerController.getIssueDetails);

router.get('/workers', managerController.getWorkers);
router.get('/workers/:id', managerController.getWorkerDetails);
router.get('/workers/:id/performance', managerController.getWorkerPerformance);

router.post('/assignments', createAssignmentValidator, managerController.createAssignment);
router.get('/assignments', managerController.getAssignments);
router.get('/assignments/:id', managerController.getAssignmentDetails);

// Verification routes
router.get('/verifications/before', verificationController.getManagerBeforeVerifications);
router.get('/verifications/before/:verificationId', verificationController.getManagerBeforeVerificationDetails);
router.patch('/verifications/before/:verificationId/review', reviewVerificationValidator, verificationController.reviewBeforeVerification);
router.get('/verifications/after', verificationController.getManagerAfterVerifications);
router.get('/verifications/after/:verificationId', verificationController.getManagerAfterVerificationDetails);
router.patch('/verifications/after/:verificationId/review', reviewVerificationValidator, verificationController.reviewAfterVerification);

// Appraisal routes
router.post('/workers/:workerId/appraisals', appraisalValidator, managerController.createAppraisal);
router.get('/workers/:workerId/appraisals', managerController.getAppraisals);
router.get('/appraisals/:appraisalId', managerController.getAppraisalDetails);
router.patch('/appraisals/:appraisalId', appraisalValidator, managerController.updateAppraisal);
router.post('/appraisals/:appraisalId/submit', managerController.submitAppraisal);

module.exports = router;
