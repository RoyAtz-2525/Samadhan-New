const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
// Webhook route - Needs raw body for signature verification (handled in app.js)
router.post(
  '/payments/razorpay/webhook',
  paymentController.razorpayWebhook
);

// Protected Manager routes
router.use('/manager', requireAuth, requireRole('MANAGER'));

router.post(
  '/manager/assignments/:assignmentId/order',
  paymentController.createPaymentOrder
);

router.post(
  '/manager/payments/:paymentId/verify',
  paymentController.verifyPayment
);

router.get(
  '/manager/assignments/:assignmentId/payment',
  paymentController.getPaymentByAssignment
);

router.get(
  '/manager/payments/:paymentId',
  paymentController.getPaymentDetails
);

module.exports = router;
