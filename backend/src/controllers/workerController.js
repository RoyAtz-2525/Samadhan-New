const workerService = require('../services/workerService');
const { validationResult } = require('express-validator');

const getDashboard = async (req, res, next) => {
  try {
    const data = await workerService.getDashboardMetrics(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const statusFilter = req.query.status;
    const assignments = await workerService.getAssignments(req.user.id, statusFilter);
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

const getAssignmentDetails = async (req, res, next) => {
  try {
    const assignment = await workerService.getAssignmentDetails(req.user.id, req.params.id);
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

const respondToAssignment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const assignment = await workerService.respondToAssignment(req.user.id, req.params.id, req.body);
    res.json({ 
      success: true, 
      data: assignment,
      message: `Assignment successfully ${req.body.action === 'ACCEPT' ? 'accepted' : 'rejected'}`
    });
  } catch (error) {
    next(error);
  }
};

const getWorkExecution = async (req, res, next) => {
  try {
    const executionData = await workerService.getWorkExecution(req.user.id, req.params.id);
    res.json({ success: true, data: executionData });
  } catch (error) {
    next(error);
  }
};

const submitWorkProgress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const progress = await workerService.submitWorkProgress(req.user.id, req.params.id, req.body, req.files);
    res.json({ success: true, data: progress, message: 'Work progress submitted successfully' });
  } catch (error) {
    next(error);
  }
};

const completeWork = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const completion = await workerService.completeWork(req.user.id, req.params.id, req.body, req.files);
    res.json({ success: true, data: completion, message: 'Work completed successfully' });
  } catch (error) {
    next(error);
  }
};

const getPerformance = async (req, res, next) => {
  try {
    const data = await workerService.getPerformanceMetrics(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getAppraisals = async (req, res, next) => {
  try {
    const appraisals = await workerService.getAppraisals(req.user.id);
    res.json({ success: true, data: appraisals });
  } catch (error) {
    next(error);
  }
};

const getAppraisalDetails = async (req, res, next) => {
  try {
    const appraisal = await workerService.getAppraisalDetails(req.user.id, req.params.appraisalId);
    res.json({ success: true, data: appraisal });
  } catch (error) {
    next(error);
  }
};

const acknowledgeAppraisal = async (req, res, next) => {
  try {
    const appraisal = await workerService.acknowledgeAppraisal(req.user.id, req.params.appraisalId);
    res.json({ success: true, data: appraisal, message: 'Appraisal acknowledged successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAssignments,
  getAssignmentDetails,
  respondToAssignment,
  getWorkExecution,
  submitWorkProgress,
  completeWork,
  getPerformance,
  getAppraisals,
  getAppraisalDetails,
  acknowledgeAppraisal
};
