const paymentService = require("../services/paymentService");
const razorpayService = require("../services/razorpayService");
const razorpayXService = require("../services/razorpayXService");

const createPaymentOrder = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const managerId = req.user.id;
    const orderData = await paymentService.createPaymentOrder(
      managerId,
      assignmentId,
    );
    res.json({ success: true, data: orderData });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const managerId = req.user.id;
    const result = await paymentService.verifyPayment(
      managerId,
      paymentId,
      req.body,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const managerId = req.user.id;
    const payment = await paymentService.getPaymentDetails(
      managerId,
      paymentId,
    );
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

const getPaymentByAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const managerId = req.user.id;
    const payment = await paymentService.getPaymentByAssignment(
      managerId,
      assignmentId,
    );
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

const getManagerPayments = async (req, res, next) => {
  try {
    const managerId = req.user.id;
    const payments = await paymentService.getManagerPayments(managerId);
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

const getWorkerPayments = async (req, res, next) => {
  try {
    const workerUserId = req.user.id;
    const payments = await paymentService.getWorkerPayments(workerUserId);
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

/**
 * Worker Bank / UPI Payout Account handlers
 */
const saveWorkerPayoutAccount = async (req, res, next) => {
  try {
    const workerUserId = req.user.id;
    const result = await paymentService.saveWorkerPayoutAccount(workerUserId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getWorkerPayoutAccount = async (req, res, next) => {
  try {
    const workerUserId = req.user.id;
    const result = await paymentService.getWorkerPayoutAccount(workerUserId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Manager initiates actual Bank / UPI Payout for a completed, verified assignment
 */
const initiateWorkerPayout = async (req, res, next) => {
  try {
    const managerUserId = req.user.id;
    const { assignmentId } = req.params;
    const result = await paymentService.initiateWorkerPayout(
      managerUserId,
      assignmentId,
      req.body
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Dual Webhook handler (Checkout & RazorpayX Payouts)
 */
const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody
      ? req.rawBody
      : typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body);

    const event = req.body?.event;
    const payload = req.body?.payload;
    // Extract provider event ID from header or body
    const eventId = req.headers["x-razorpay-event-id"] || req.body?.event_id || req.body?.id || null;

    if (event && event.startsWith("payout.")) {
      // Payout webhook signature verification
      const isValid = razorpayXService.verifyPayoutWebhookSignature(rawBody, signature);
      if (!isValid) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid payout webhook signature" });
      }

      const result = await paymentService.handlePayoutWebhook(event, payload, eventId);
      return res.json({ success: true, result });
    }

    // Standard checkout webhook
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const result = await paymentService.handleWebhook(event, payload, eventId);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Webhook processing error:", err.name || "Error");
    res.status(500).json({ success: false, error: "Webhook processing error" });
  }
};

const getOperationalMetrics = async (req, res, next) => {
  try {
    const metrics = await paymentService.getPaymentOperationalMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};

const reconcilePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const result = await paymentService.reconcilePaymentWithProvider(paymentId);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getPaymentByAssignment,
  getManagerPayments,
  getWorkerPayments,
  saveWorkerPayoutAccount,
  getWorkerPayoutAccount,
  initiateWorkerPayout,
  razorpayWebhook,
  getOperationalMetrics,
  reconcilePayment,
};
