const { validationResult } = require('express-validator');
const issueService = require('../services/issueService');

const getCategories = async (req, res, next) => {
  try {
    const categories = await issueService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const issueData = req.body;
    const files = req.files; // Populated by multer

    const issue = await issueService.createIssue(userId, issueData, files);
    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
};

const getMyIssues = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status
    };
    
    const issues = await issueService.getCitizenIssues(userId, filters);
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

const getIssueDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;
    
    const issue = await issueService.getCitizenIssueDetails(userId, issueId);
    res.json(issue);
  } catch (error) {
    next(error);
  }
};

const submitReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;
    const reviewData = req.body;
    
    const review = await issueService.submitReview(userId, issueId, reviewData);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const getReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;
    
    const review = await issueService.getReview(userId, issueId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;
    const feedbackData = req.body;
    
    const feedback = await issueService.submitFeedback(userId, issueId, feedbackData);
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;
    
    const feedback = await issueService.getFeedback(userId, issueId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createIssue,
  getMyIssues,
  getIssueDetails,
  submitReview,
  getReview,
  submitFeedback,
  getFeedback
};
