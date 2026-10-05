const managerService = require('../services/managerService');
const { validationResult } = require('express-validator');

const getDashboard = async (req, res, next) => {
  try {
    const data = await managerService.getDashboardMetrics(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getApprovedIssues = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      priority: req.query.priority
    };
    const issues = await managerService.getApprovedIssues(filters);
    res.json({ success: true, data: issues });
  } catch (error) {
    next(error);
  }
};

const getIssueDetails = async (req, res, next) => {
  try {
    const issue = await managerService.getIssueDetails(req.params.id);
    res.json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

const getWorkers = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status
    };
    const issueLat = req.query.lat;
    const issueLon = req.query.lon;
    
    const workers = await managerService.getWorkers(filters, issueLat, issueLon);
    res.json({ success: true, data: workers });
  } catch (error) {
    next(error);
  }
};

const getWorkerDetails = async (req, res, next) => {
  try {
    const worker = await managerService.getWorkerDetails(req.params.id);
    res.json({ success: true, data: worker });
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const assignment = await managerService.createAssignment(req.user.id, req.body);
    res.status(201).json({ success: true, data: assignment, message: 'Worker assigned successfully' });
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const assignments = await managerService.getAssignments(req.user.id);
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

const getAssignmentDetails = async (req, res, next) => {
  try {
    const assignment = await managerService.getAssignmentDetails(req.user.id, req.params.id);
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

const getWorkerPerformance = async (req, res, next) => {
  try {
    const data = await managerService.getWorkerPerformance(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createAppraisal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const appraisal = await managerService.createAppraisal(req.user.id, req.params.workerId, req.body);
    res.status(201).json({ success: true, data: appraisal, message: 'Appraisal created successfully' });
  } catch (error) {
    next(error);
  }
};

const getAppraisals = async (req, res, next) => {
  try {
    const appraisals = await managerService.getAppraisals(req.user.id, req.params.workerId);
    res.json({ success: true, data: appraisals });
  } catch (error) {
    next(error);
  }
};

const getAppraisalDetails = async (req, res, next) => {
  try {
    const appraisal = await managerService.getAppraisalDetails(req.user.id, req.params.appraisalId);
    res.json({ success: true, data: appraisal });
  } catch (error) {
    next(error);
  }
};

const updateAppraisal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const appraisal = await managerService.updateAppraisal(req.user.id, req.params.appraisalId, req.body);
    res.json({ success: true, data: appraisal, message: 'Appraisal updated successfully' });
  } catch (error) {
    next(error);
  }
};

const submitAppraisal = async (req, res, next) => {
  try {
    const appraisal = await managerService.submitAppraisal(req.user.id, req.params.appraisalId);
    res.json({ success: true, data: appraisal, message: 'Appraisal submitted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getApprovedIssues,
  getIssueDetails,
  getWorkers,
  getWorkerDetails,
  createAssignment,
  getAssignments,
  getAssignmentDetails,
  getWorkerPerformance,
  createAppraisal,
  getAppraisals,
  getAppraisalDetails,
  updateAppraisal,
  submitAppraisal
};
