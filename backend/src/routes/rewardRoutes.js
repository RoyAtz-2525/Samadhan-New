const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Citizen Reward routes
router.get(
  '/citizen/rewards/summary',
  requireAuth,
  requireRole('CITIZEN'),
  rewardController.getCitizenRewardSummary
);

router.get(
  '/citizen/rewards/history',
  requireAuth,
  requireRole('CITIZEN'),
  rewardController.getCitizenRewardHistory
);

router.get(
  '/citizen/rewards/catalog',
  requireAuth,
  requireRole('CITIZEN'),
  rewardController.getCatalog
);

router.post(
  '/citizen/rewards/redeem',
  requireAuth,
  requireRole('CITIZEN'),
  rewardController.redeemReward
);

// Admin & Super Admin audit routes
router.get(
  '/admin/rewards/audit',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  rewardController.getAdminRewardAudit
);

module.exports = router;
