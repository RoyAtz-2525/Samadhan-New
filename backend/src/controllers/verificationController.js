const verificationService = require('../services/verificationService');
const { validationResult } = require('express-validator');

const getBeforeVerification = async (req, res, next) => {
  try {
    const data = await verificationService.getBeforeVerification(req.user.id, req.params.assignmentId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const submitBeforeVerification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const files = req.files || [];
    
    const verification = await verificationService.submitBeforeVerification(
      req.user.id, 
      req.params.assignmentId, 
      req.body,
      files
    );
    
    res.status(201).json({ 
      success: true, 
      data: verification,
      message: 'Before-work verification submitted successfully and is pending approval.'
    });
  } catch (error) {
    next(error);
  }
};

const getManagerBeforeVerifications = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status || 'PENDING',
      priority: req.query.priority,
      categoryId: req.query.categoryId
    };
    
    const verifications = await verificationService.getManagerBeforeVerifications(req.user.id, filters);
    res.json({ success: true, data: verifications });
  } catch (error) {
    next(error);
  }
};

const getManagerBeforeVerificationDetails = async (req, res, next) => {
  try {
    const verification = await verificationService.getManagerBeforeVerificationDetails(req.user.id, req.params.verificationId);
    res.json({ success: true, data: verification });
  } catch (error) {
    next(error);
  }
};

const reviewBeforeVerification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const verification = await verificationService.reviewBeforeVerification(
      req.user.id,
      req.params.verificationId,
      req.body
    );
    
    res.json({ 
      success: true, 
      data: verification,
      message: `Verification ${req.body.action.toLowerCase().replace('_', ' ')} successfully.`
    });
  } catch (error) {
    next(error);
  }
};

const getAfterVerification = async (req, res, next) => {
  try {
    const data = await verificationService.getAfterVerification(req.user.id, req.params.assignmentId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const submitAfterVerification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const files = req.files || [];
    
    const verification = await verificationService.submitAfterVerification(
      req.user.id, 
      req.params.assignmentId, 
      req.body,
      files
    );
    
    res.status(201).json({ 
      success: true, 
      data: verification,
      message: 'After-work verification submitted successfully and is pending approval.'
    });
  } catch (error) {
    next(error);
  }
};

const getManagerAfterVerifications = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status || 'PENDING',
      priority: req.query.priority,
      categoryId: req.query.categoryId
    };
    
    const verifications = await verificationService.getManagerAfterVerifications(req.user.id, filters);
    res.json({ success: true, data: verifications });
  } catch (error) {
    next(error);
  }
};

const getManagerAfterVerificationDetails = async (req, res, next) => {
  try {
    const verification = await verificationService.getManagerAfterVerificationDetails(req.user.id, req.params.verificationId);
    res.json({ success: true, data: verification });
  } catch (error) {
    next(error);
  }
};

const reviewAfterVerification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const verification = await verificationService.reviewAfterVerification(
      req.user.id,
      req.params.verificationId,
      req.body
    );
    
    res.json({ 
      success: true, 
      data: verification,
      message: `Verification ${req.body.action.toLowerCase().replace('_', ' ')} successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBeforeVerification,
  submitBeforeVerification,
  getManagerBeforeVerifications,
  getManagerBeforeVerificationDetails,
  reviewBeforeVerification,
  getAfterVerification,
  submitAfterVerification,
  getManagerAfterVerifications,
  getManagerAfterVerificationDetails,
  reviewAfterVerification
};
