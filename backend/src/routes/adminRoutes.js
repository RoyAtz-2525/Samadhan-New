const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { reviewIssueValidator, updatePriorityValidator } = require('../validators/adminValidators');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', adminController.getDashboardMetrics);
router.get('/issues', adminController.getIssues);
router.get('/issues/:id', adminController.getIssueDetails);
router.patch('/issues/:id/review', reviewIssueValidator, adminController.reviewIssue);
router.patch('/issues/:id/priority', updatePriorityValidator, adminController.updatePriority);

module.exports = router;
