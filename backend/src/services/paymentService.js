const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const razorpayService = require("./razorpayService");

const createPaymentOrder = async (managerUserId, assignmentId) => {
  // Verify manager
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId },
  });
  if (!manager)
    throw Object.assign(new Error("Unauthorized"), { statusCode: 403 });

  // Get assignment and related data
  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      issue: true,
      afterVerification: true,
    },
  });

  if (!assignment)
    throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
  if (assignment.managerId !== manager.id)
    throw Object.assign(new Error("Unauthorized to pay for this assignment"), {
      statusCode: 403,
    });

  // Eligibility checks
  if (assignment.status !== "COMPLETED")
    throw Object.assign(new Error("Assignment must be COMPLETED"), {
      statusCode: 400,
    });
  if (assignment.issue.status !== "RESOLVED")
    throw Object.assign(new Error("Issue must be RESOLVED"), {
      statusCode: 400,
    });
  if (
    !assignment.afterVerification ||
    assignment.afterVerification.status !== "APPROVED"
  ) {
    throw Object.assign(new Error("After-work verification must be APPROVED"), {
      statusCode: 400,
    });
  }

  // Check if a completed payment already exists
  const existingCompletedPayment = await prisma.payment.findFirst({
    where: {
      assignmentId,
      status: "COMPLETED",
    },
  });
  if (existingCompletedPayment)
    throw Object.assign(
      new Error("Payment already completed for this assignment"),
      { statusCode: 400 },
    );

  // Check for any PENDING payment record to reuse, otherwise create new
  let payment = await prisma.payment.findFirst({
    where: {
      assignmentId,
      status: { in: ["PENDING", "PROCESSING", "FAILED"] },
    },
  });

  const amount = Number(assignment.assignedRate);
  if (amount <= 0)
    throw Object.assign(new Error("Invalid payment amount"), {
      statusCode: 400,
    });

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        workerId: assignment.workerId,
        assignmentId: assignment.id,
        issueId: assignment.issueId,
        amount: amount,
        rate: amount,
        status: "PENDING",
        approvedById: managerUserId,
      },
    });
  }

  // Create Razorpay Order
  let order;
  try {
    order = await razorpayService.createOrder(
      amount,
      "INR",
      `receipt_${payment.id}`,
    );
  } catch (err) {
    console.error("Payment order creation failed:", err.name || "Error");
    throw Object.assign(new Error("Failed to create Razorpay order"), {
      statusCode: 500,
      details: err.message,
    });
  }

  // Update payment with gateway details
  payment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      gateway: "RAZORPAY",
      gatewayTransactionId: order.id,
      status: "PENDING",
    },
  });

  // Log transaction
  await prisma.paymentTransaction.create({
    data: {
      paymentId: payment.id,
      gateway: "RAZORPAY",
      transactionId: order.id,
      amount: amount,
      currency: "INR",
      status: "CREATED",
    },
  });

  return {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    razorpayOrderId: order.id,
    amount: amount,
    currency: "INR",
    paymentId: payment.id,
    workerId: assignment.workerId,
  };
};

const verifyPayment = async (managerUserId, paymentId, razorpayData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    razorpayData;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { assignment: true },
  });

  if (!payment)
    throw Object.assign(new Error("Payment not found"), { statusCode: 404 });

  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId },
  });
  if (payment.assignment.managerId !== manager.id) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 403 });
  }

  if (payment.status === "COMPLETED") {
    return { success: true, message: "Payment already completed", payment };
  }

  // Ensure the order ID matches what was created by the server
  if (payment.gatewayTransactionId !== razorpay_order_id) {
    throw Object.assign(new Error("Invalid order ID"), { statusCode: 400 });
  }

  const isValid = razorpayService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  if (isValid) {
    // Transaction successful
    const updatedPayment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          gatewayTransactionId: razorpay_payment_id,
          paidAt: new Date(),
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: paymentId,
          gateway: "RAZORPAY",
          transactionId: razorpay_payment_id,
          amount: p.amount,
          currency: "INR",
          status: "COMPLETED",
          gatewayResponse: razorpayData,
        },
      });

      // Notify Worker
      const workerProfile = await tx.workerProfile.findUnique({
        where: { id: p.workerId },
      });
      await tx.notification.create({
        data: {
          userId: workerProfile.userId,
          type: "PAYMENT",
          title: "Payment Received",
          message: `Payment of ₹${p.amount} for your completed assignment has been successfully processed.`,
          assignmentId: p.assignmentId,
          issueId: p.issueId,
        },
      });

      // Notify Manager
      await tx.notification.create({
        data: {
          userId: managerUserId,
          type: "PAYMENT",
          title: "Payment Successful",
          message: `Payment of ₹${p.amount} to worker successfully processed.`,
          assignmentId: p.assignmentId,
          issueId: p.issueId,
        },
      });

      return p;
    });

    return { success: true, payment: updatedPayment };
  } else {
    // Transaction failed signature verification
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        failureReason: "Invalid signature verification",
      },
    });

    await prisma.paymentTransaction.create({
      data: {
        paymentId: paymentId,
        gateway: "RAZORPAY",
        transactionId: razorpay_payment_id || "unknown",
        amount: payment.amount,
        currency: "INR",
        status: "FAILED",
        gatewayResponse: razorpayData,
      },
    });

    throw Object.assign(new Error("Invalid payment signature"), {
      statusCode: 400,
    });
  }
};

const getPaymentDetails = async (managerUserId, paymentId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId },
  });
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      worker: { include: { user: { select: { email: true, phone: true } } } },
      transactions: { orderBy: { timestamp: "desc" } },
    },
  });

  if (!payment)
    throw Object.assign(new Error("Payment not found"), { statusCode: 404 });

  const assignment = await prisma.workAssignment.findUnique({
    where: { id: payment.assignmentId },
  });
  if (assignment.managerId !== manager.id) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 403 });
  }

  return payment;
};

const getPaymentByAssignment = async (managerUserId, assignmentId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId },
  });
  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment)
    throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
  if (assignment.managerId !== manager.id)
    throw Object.assign(new Error("Unauthorized"), { statusCode: 403 });

  // Returns the latest payment record for this assignment
  return await prisma.payment.findFirst({
    where: { assignmentId },
    orderBy: { createdAt: "desc" },
    include: {
      transactions: { orderBy: { timestamp: "desc" }, take: 5 },
    },
  });
};

const handleWebhook = async (event, payload) => {
  // Simplistic webhook handler for idempotency
  const paymentId = payload.payment?.entity?.notes?.receipt?.replace(
    "receipt_",
    "",
  );
  const status = payload.payment?.entity?.status;

  if (!paymentId) return;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) return;

  if (payment.status === "COMPLETED") return; // Idempotent

  if (event === "payment.captured" && status === "captured") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          gatewayTransactionId: payload.payment.entity.id,
          paidAt: new Date(),
        },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          gateway: "RAZORPAY",
          transactionId: payload.payment.entity.id,
          amount: payment.amount,
          currency: "INR",
          status: "COMPLETED",
          gatewayResponse: payload,
        },
      });
    });
  } else if (event === "payment.failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason:
          payload.payment.entity.error_description ||
          "Webhook reported failure",
      },
    });
    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        gateway: "RAZORPAY",
        transactionId: payload.payment.entity.id,
        amount: payment.amount,
        currency: "INR",
        status: "FAILED",
        gatewayResponse: payload,
      },
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getPaymentByAssignment,
  handleWebhook,
};
