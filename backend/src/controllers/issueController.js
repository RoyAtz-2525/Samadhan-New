const cacheService = require('../services/cacheService');
const { prisma } = require('../config/db');
const { validationResult } = require('express-validator');
const issueService = require('../services/issueService');

const getCategories = async (req, res, next) => {
  try {
    const cached = await cacheService.get(cacheService.CACHE_KEYS.CATEGORIES);
    if (cached) {
      return res.json(cached);
    }
    const categories = await issueService.getCategories();
    await cacheService.set(cacheService.CACHE_KEYS.CATEGORIES, categories, 3600);
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
    cacheService.invalidateIssueCaches().catch(() => {});
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

  // Public Map Issues
  getPublicMapIssues: async (req, res) => {
    try {
      const cached = await cacheService.get(cacheService.CACHE_KEYS.PUBLIC_MAP);
      if (cached) {
        return res.status(200).json(cached);
      }

      const issues = await prisma.issue.findMany({
        select: {
          id: true,
          title: true,
          category: {
            select: { name: true }
          },
          status: true,
          latitude: true,
          longitude: true
        }
      });
      
      const safeIssues = issues.map(i => ({
        id: i.id,
        title: i.title,
        category: i.category?.name || 'Unknown',
        status: i.status,
        latitude: i.latitude,
        longitude: i.longitude
      }));

      await cacheService.set(cacheService.CACHE_KEYS.PUBLIC_MAP, safeIssues, 300);
      res.status(200).json(safeIssues);
    } catch (error) {
      console.error('Error fetching public map issues:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getCategories,
  createIssue,
  getMyIssues,
  getIssueDetails,
  submitReview,
  getReview,
  submitFeedback,
  getFeedback
};
