const Razorpay = require("razorpay");
const crypto = require("crypto");

const isCheckoutTestMode = () => {
  return process.env.RAZORPAY_CHECKOUT_TEST_MODE === "true" || process.env.PAYMENT_TEST_MODE === "true";
};

const getRazorpayInstance = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

const signaturesMatch = (expectedSignature, signature) => {
  if (typeof signature !== "string") return false;
  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
};

const createOrder = async (amount, currency = "INR", receipt = "", notes = {}) => {
  const isTestMode = isCheckoutTestMode();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && isTestMode) {
    throw new Error("Checkout test mode cannot be enabled in production.");
  }

  const key_id = process.env.RAZORPAY_KEY_ID;

  if (isTestMode && !key_id) {
    // Return mock order for testing without live Razorpay keys
    return {
      id: `order_dummy_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      receipt,
      status: "created",
      attempts: 0,
      notes,
    };
  }

  if (!key_id || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured.");
  }

  const instance = getRazorpayInstance();
  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt,
    notes,
  };
  return await instance.orders.create(options);
};

const verifySignature = (orderId, paymentId, signature) => {
  const isTestMode = isCheckoutTestMode();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && isTestMode) {
    throw new Error("Checkout test mode cannot be enabled in production.");
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;

  // In test mode without secret, allow simulated verification
  if (isTestMode && !secret) {
    if (!signature || signature === "invalid_signature" || signature === "tampered_signature") {
      return false;
    }
    // Accept valid simulation signatures
    return (
      typeof signature === "string" &&
      (signature.startsWith("test_simulated_") ||
        signature.startsWith("mock_") ||
        signature === "simulated_valid_signature" ||
        (orderId && orderId.startsWith("order_dummy_")))
    );
  }

  if (!secret) {
    throw new Error("Razorpay key secret is not configured.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");
  return signaturesMatch(generatedSignature, signature);
};

const verifyWebhookSignature = (body, signature) => {
  const isTestMode = isCheckoutTestMode();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && isTestMode) {
    throw new Error("Checkout test mode cannot be enabled in production.");
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (isTestMode && !secret) {
    if (!signature || signature === "invalid_signature") return false;
    return (
      typeof signature === "string" &&
      (signature.startsWith("test_simulated_") || signature === "mock_webhook_signature")
    );
  }

  if (!secret) {
    throw new Error("Razorpay webhook secret is not configured.");
  }

  const rawBodyString = Buffer.isBuffer(body) ? body.toString("utf8") : typeof body === "string" ? body : JSON.stringify(body);
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBodyString)
    .digest("hex");
  return signaturesMatch(expectedSignature, signature);
};

module.exports = {
  createOrder,
  verifySignature,
  verifyWebhookSignature,
};
