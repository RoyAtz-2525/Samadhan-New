const paymentService = require("../services/paymentService");
const razorpayService = require("../services/razorpayService");

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

const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const isValid = razorpayService.verifyWebhookSignature(
      req.rawBody || JSON.stringify(req.body),
      signature,
    );

    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const { event, payload } = req.body;
    await paymentService.handleWebhook(event, payload);

    res.json({ success: true });
  } catch (err) {
    // Return 200 to prevent razorpay from retrying infinitely on our code errors,
    // or return 500 if we want retries. Usually 200 is safer if it's already caught.
    console.error("Webhook processing failed:", err.name || "Error");
    res.status(500).json({ success: false });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getPaymentByAssignment,
  razorpayWebhook,
};
