const express = require('express');
const router = express.Router();
const multer = require('multer');
const issueController = require('../controllers/issueController');
const { createIssueValidator } = require('../validators/issueValidators');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // max 5 files
  }
});

// GET categories - open to authenticated users (could be public, but let's require auth)
router.get('/categories', requireAuth, issueController.getCategories);

// Citizen routes
router.get('/my', requireAuth, requireRole('CITIZEN'), issueController.getMyIssues);
router.get('/:id', requireAuth, requireRole('CITIZEN'), issueController.getIssueDetails);
router.post(
  '/',
  requireAuth,
  requireRole('CITIZEN'),
  upload.array('media', 5),
  createIssueValidator,
  issueController.createIssue
);

// Review & Feedback Routes
router.post('/:id/review', requireAuth, requireRole('CITIZEN'), issueController.submitReview);
router.get('/:id/review', requireAuth, requireRole('CITIZEN'), issueController.getReview);

router.post('/:id/feedback', requireAuth, requireRole('CITIZEN'), issueController.submitFeedback);
router.get('/:id/feedback', requireAuth, requireRole('CITIZEN'), issueController.getFeedback);

module.exports = router;
