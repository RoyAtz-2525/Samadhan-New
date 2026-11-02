const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Webhook route - Uses req.rawBody captured in app.js
router.post(
  '/payments/razorpay/webhook',
  paymentController.razorpayWebhook
);

// Worker payment & payout routes
router.get(
  '/worker/payments',
  requireAuth,
  requireRole('WORKER'),
  paymentController.getWorkerPayments
);

router.get(
  '/worker/payout-account',
  requireAuth,
  requireRole('WORKER'),
  paymentController.getWorkerPayoutAccount
);

router.post(
  '/worker/payout-account',
  requireAuth,
  requireRole('WORKER'),
  paymentController.saveWorkerPayoutAccount
);

// Manager payment & payout routes
router.get(
  '/manager/payments',
  requireAuth,
  requireRole('MANAGER'),
  paymentController.getManagerPayments
);

router.post(
  '/manager/assignments/:assignmentId/payout',
  requireAuth,
  requireRole('MANAGER'),
  paymentController.initiateWorkerPayout
);

router.post(
  '/manager/assignments/:assignmentId/order',
  requireAuth,
  requireRole('MANAGER'),
  paymentController.createPaymentOrder
);

router.post(
  '/manager/payments/:paymentId/verify',
  requireAuth,
  requireRole('MANAGER'),
  paymentController.verifyPayment
);

router.get(
  '/manager/assignments/:assignmentId/payment',
  requireAuth,
  requireRole('MANAGER'),
  paymentController.getPaymentByAssignment
);

router.get(
  '/manager/payments/:paymentId',
  requireAuth,
  requireRole('MANAGER'),
  paymentController.getPaymentDetails
);

router.post(
  '/manager/payments/:paymentId/reconcile',
  requireAuth,
  requireRole('MANAGER'),
  paymentController.reconcilePayment
);

router.get(
  '/payments/operational-metrics',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  paymentController.getOperationalMetrics
);

module.exports = router;
