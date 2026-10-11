const cacheService = require('../services/cacheService');
const { validationResult } = require('express-validator');
const adminService = require('../services/adminService');
const slaService = require('../services/slaService');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const cached = await cacheService.get(cacheService.CACHE_KEYS.ADMIN_METRICS);
    if (cached) {
      return res.json(cached);
    }
    const metrics = await adminService.getAdminDashboardMetrics();
    await cacheService.set(cacheService.CACHE_KEYS.ADMIN_METRICS, metrics, 120);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
};

const getIssues = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status
    };
    
    const issues = await adminService.getIssues(filters);
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

const getIssueDetails = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const issue = await adminService.getIssueDetails(issueId);
    res.json(issue);
  } catch (error) {
    next(error);
  }
};

const reviewIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const adminId = req.user.id;
    const issueId = req.params.id;
    const { action, reason } = req.body;

    const issue = await adminService.reviewIssue(adminId, issueId, action, reason);
    res.json(issue);
  } catch (error) {
    next(error);
  }
};

const updatePriority = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const adminId = req.user.id;
    const issueId = req.params.id;
    const { priority } = req.body;

    const issue = await adminService.updateIssuePriority(adminId, issueId, priority);
    res.json(issue);
  } catch (error) {
    next(error);
  }
};

const reconcileSla = async (req, res, next) => {
  try {
    const summary = await slaService.reconcileOverdueIssues();
    res.json({
      status: 'success',
      message: 'SLA overdue reconciliation completed successfully',
      ...summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getIssues,
  getIssueDetails,
  reviewIssue,
  updatePriority,
  reconcileSla,
};
