const superAdminService = require('../services/superAdminService');

const getOverview = async (req, res, next) => {
  try {
    const overview = await superAdminService.getPlatformOverview();
    res.json(overview);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const filters = {
      role: req.query.role,
      status: req.query.status,
      search: req.query.search
    };
    const users = await superAdminService.getAllUsers(filters);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getIssues = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      categoryId: req.query.categoryId
    };
    const issues = await superAdminService.getAllIssues(filters);
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

const getIssueDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const issue = await superAdminService.getIssueDetail(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status
    };
    const assignments = await superAdminService.getAllAssignments(filters);
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

const getVerifications = async (req, res, next) => {
  try {
    const { type } = req.query; // 'all', 'before', 'after'
    const verifications = await superAdminService.getAllVerifications(type || 'all');
    res.json(verifications);
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status
    };
    const payments = await superAdminService.getAllPayments(filters);
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const filters = {
      action: req.query.action,
      entityType: req.query.entityType
    };
    const logs = await superAdminService.getAuditLogs(filters);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { range } = req.query; // '7d', '30d', '90d', '1y'
    const analytics = await superAdminService.getAnalytics(range);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      isRead: req.query.isRead,
      range: req.query.range,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };
    const notifications = await superAdminService.getNotifications(filters);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await superAdminService.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

const getAppraisals = async (req, res, next) => {
  try {
    const filters = {
      workerId: req.query.workerId,
      managerId: req.query.managerId,
      status: req.query.status,
      overallRating: req.query.overallRating ? parseInt(req.query.overallRating) : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit
    };
    const appraisals = await superAdminService.getAllAppraisals(filters);
    res.json(appraisals);
  } catch (error) {
    next(error);
  }
};

const getAppraisalDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appraisal = await superAdminService.getAppraisalDetail(id);
    if (!appraisal) {
      return res.status(404).json({ error: 'Appraisal not found' });
    }
    res.json(appraisal);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getUsers,
  getIssues,
  getIssueDetail,
  getAssignments,
  getVerifications,
  getPayments,
  getAuditLogs,
  getAnalytics,
  getNotifications,
  getSettings,
  getAppraisals,
  getAppraisalDetail
};
