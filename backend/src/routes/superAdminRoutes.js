const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Protect all routes
router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));

// Analytics & Overview
router.get('/overview', superAdminController.getOverview);
router.get('/analytics', superAdminController.getAnalytics);

// Users
router.get('/users', superAdminController.getUsers);

// Issues
router.get('/issues', superAdminController.getIssues);
router.get('/issues/:id', superAdminController.getIssueDetail);

// Assignments
router.get('/assignments', superAdminController.getAssignments);

// Verifications
router.get('/verifications', superAdminController.getVerifications);

// Payments
router.get('/payments', superAdminController.getPayments);

// Audit Logs
router.get('/audit-logs', superAdminController.getAuditLogs);

// Notifications
router.get('/notifications', superAdminController.getNotifications);

// Appraisals
router.get('/appraisals', superAdminController.getAppraisals);
router.get('/appraisals/:id', superAdminController.getAppraisalDetail);

// Settings
router.get('/settings', superAdminController.getSettings);

module.exports = router;
