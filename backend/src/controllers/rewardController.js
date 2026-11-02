const rewardService = require('../services/rewardService');
const { REWARD_CATALOG } = require('../config/rewardConfig');

const getCitizenRewardSummary = async (req, res, next) => {
  try {
    const data = await rewardService.getCitizenRewardSummary(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getCitizenRewardHistory = async (req, res, next) => {
  try {
    const data = await rewardService.getCitizenRewardHistory(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getCatalog = async (req, res) => {
  res.json({ success: true, data: REWARD_CATALOG });
};

const redeemReward = async (req, res, next) => {
  try {
    const { catalogItemId } = req.body;
    if (!catalogItemId) {
      return res.status(400).json({ success: false, message: 'catalogItemId is required' });
    }
    const result = await rewardService.redeemReward(req.user.id, catalogItemId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getAdminRewardAudit = async (req, res, next) => {
  try {
    const data = await rewardService.getAdminRewardAudit(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCitizenRewardSummary,
  getCitizenRewardHistory,
  getCatalog,
  redeemReward,
  getAdminRewardAudit,
};
