const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { respondAssignmentValidator } = require('../validators/workerValidators');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);
router.use(requireRole('WORKER'));

router.get('/dashboard', workerController.getDashboard);
router.get('/performance', workerController.getPerformance);
router.get('/assignments', workerController.getAssignments);
router.get('/assignments/:id', workerController.getAssignmentDetails);
router.patch('/assignments/:id/respond', respondAssignmentValidator, workerController.respondToAssignment);

const upload = require('../middleware/uploadMiddleware');
const { workProgressValidator, workCompleteValidator } = require('../validators/workerValidators');

router.get('/assignments/:id/work', workerController.getWorkExecution);
router.post('/assignments/:id/work/progress', upload.array('media', 5), workProgressValidator, workerController.submitWorkProgress);
router.patch('/assignments/:id/work/complete', upload.array('media', 5), workCompleteValidator, workerController.completeWork);

// Appraisal routes
router.get('/appraisals', workerController.getAppraisals);
router.get('/appraisals/:appraisalId', workerController.getAppraisalDetails);
router.post('/appraisals/:appraisalId/acknowledge', workerController.acknowledgeAppraisal);

module.exports = router;
