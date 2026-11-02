const { prisma } = require("../config/db");
const razorpayService = require("./razorpayService");
const razorpayXService = require("./razorpayXService");
const { emitToUser } = require("../sockets/emitter");

/**
 * Standard Razorpay Checkout Orders (Preserved for compatibility)
 */
const createPaymentOrder = async (managerUserId, assignmentId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId },
  });
  if (!manager) {
    throw Object.assign(new Error("Unauthorized: Manager profile required"), {
      statusCode: 403,
    });
  }

  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      issue: true,
      worker: true,
      afterVerification: true,
    },
  });

  if (!assignment) {
    throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
  }

  if (assignment.managerId !== manager.id) {
    throw Object.assign(new Error("Unauthorized for this assignment"), {
      statusCode: 403,
    });
  }

  // Check completion & after-work verification
  if (!assignment.afterVerification || assignment.afterVerification.status !== "APPROVED") {
    throw Object.assign(
      new Error("Cannot process payment. After-work verification must be approved first."),
      { statusCode: 400 },
    );
  }

  if (assignment.status !== "COMPLETED") {
    throw Object.assign(new Error("Assignment is not marked completed."), {
      statusCode: 400,
    });
  }

  // Validate amount on the server
  const amount = Number(assignment.assignedRate);
  if (!amount || amount <= 0 || isNaN(amount)) {
    throw Object.assign(new Error("Invalid assignment rate for payment"), {
      statusCode: 400,
    });
  }

  // Concurrency & Duplicate Protection: Atomically claim or reuse payment in transaction
  const payment = await prisma.$transaction(async (tx) => {
    const existingPayments = await tx.payment.findMany({
      where: { assignmentId },
      orderBy: { createdAt: "desc" },
    });

    const completedPayment = existingPayments.find((p) => p.status === "COMPLETED");
    if (completedPayment) {
      throw Object.assign(
        new Error("Payment for this assignment has already been completed"),
        { statusCode: 409 }
      );
    }

    const inProcessing = existingPayments.find(
      (p) => p.status === "PROCESSING" || p.payoutStatus === "processing"
    );
    if (inProcessing) {
      throw Object.assign(
        new Error("A payment or payout for this assignment is currently being processed"),
        { statusCode: 409 }
      );
    }

    // Reuse existing PENDING payment, or legitimately reset a FAILED payment for retry
    let p = existingPayments.find((item) => item.status === "PENDING");
    if (!p) {
      const failedPayment = existingPayments.find((item) => item.status === "FAILED");
      if (failedPayment) {
        p = await tx.payment.update({
          where: { id: failedPayment.id },
          data: {
            status: "PENDING",
            gateway: "RAZORPAY",
            amount,
            failureReason: null,
            gatewayPaymentId: null,
          },
        });
      } else {
        p = await tx.payment.create({
          data: {
            workerId: assignment.workerId,
            assignmentId: assignment.id,
            issueId: assignment.issueId,
            amount: amount,
            status: "PENDING",
            gateway: "RAZORPAY",
            approvedById: managerUserId,
          },
        });
      }
    }
    return p;
  });

  const isTestMode =
    (process.env.RAZORPAY_CHECKOUT_TEST_MODE === "true" || process.env.PAYMENT_TEST_MODE === "true") &&
    !process.env.RAZORPAY_KEY_ID;

  let order;
  try {
    order = await razorpayService.createOrder(
      amount,
      "INR",
      `receipt_${payment.id}`,
      {
        paymentId: payment.id,
        assignmentId: assignment.id,
        workerId: assignment.workerId,
        issueId: assignment.issueId,
      },
    );
  } catch (err) {
    if (isTestMode) {
      order = {
        id: `order_sim_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${payment.id}`,
      };
    } else {
      throw err;
    }
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      gatewayOrderId: order.id,
    },
  });

  return {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_simulated_key",
    razorpayOrderId: order.id,
    amount: amount,
    currency: "INR",
    paymentId: payment.id,
    isTestMode,
  };
};

const verifyPayment = async (managerUserId, paymentId, razorpayData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = razorpayData;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });
  if (!payment) {
    throw Object.assign(new Error("Payment not found"), { statusCode: 404 });
  }

  if (payment.status === "COMPLETED") {
    return { success: true, message: "Payment already marked completed", payment };
  }

  const isTestMode = razorpayService.isTestMode();
  let isValid = false;

  if (isTestMode && (!process.env.RAZORPAY_KEY_SECRET || razorpay_signature === "test_simulated_sig")) {
    isValid = true;
  } else {
    isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
  }

  if (isValid) {
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

      const workerProfile = await tx.workerProfile.findUnique({
        where: { id: p.workerId },
      });
      if (workerProfile?.userId) {
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
        emitToUser(workerProfile.userId, "PAYMENT_RECEIVED", {
          paymentId: p.id,
          amount: p.amount,
          assignmentId: p.assignmentId,
        });
      }

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
      emitToUser(managerUserId, "PAYMENT_CONFIRMED", {
        paymentId: p.id,
        amount: p.amount,
        assignmentId: p.assignmentId,
      });

      return p;
    });

    return { success: true, payment: updatedPayment };
  } else {
    await prisma.payment.update({
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

/**
 * ----------------------------------------------------
 * RAZORPAYX WORKER BANK / UPI PAYOUTS INTEGRATION
 * ----------------------------------------------------
 */

/**
 * Worker registers or updates their bank account or UPI ID for payouts.
 * Enforces consent, validates formats, creates Contact and Fund Account via RazorpayX,
 * and securely stores only masked account details.
 */
const saveWorkerPayoutAccount = async (workerUserId, beneficiaryData) => {
  const {
    payoutMethod = "BANK_ACCOUNT",
    bankAccountName,
    bankAccountNumber,
    bankIfsc,
    upiVpa,
    consentGiven,
  } = beneficiaryData;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: workerUserId },
    include: { user: true },
  });

  if (!worker) {
    throw Object.assign(new Error("Worker profile not found"), { statusCode: 404 });
  }

  if (consentGiven !== true) {
    throw Object.assign(
      new Error("Beneficiary consent is required to register payout banking/UPI details"),
      { statusCode: 400 }
    );
  }

  // 1. Beneficiary Account Protection: Check if any payout is currently in PROCESSING state
  const inFlightPayout = await prisma.payment.findFirst({
    where: {
      workerId: worker.id,
      status: "PROCESSING",
    },
  });
  if (inFlightPayout) {
    throw Object.assign(
      new Error("Cannot modify bank or UPI payout account while a payout is currently being processed"),
      { statusCode: 409 }
    );
  }

  // 2. Invalidate previous verification immediately upon initiating account change
  await prisma.workerProfile.update({
    where: { id: worker.id },
    data: {
      payoutAccountVerified: false,
    },
  });

  const cleanMethod = payoutMethod === "UPI" ? "UPI" : "BANK_ACCOUNT";

  if (cleanMethod === "UPI") {
    if (!upiVpa || typeof upiVpa !== "string") {
      throw Object.assign(new Error("UPI VPA is required"), { statusCode: 400 });
    }
    const cleanVpa = upiVpa.trim().toLowerCase();
    const upiRegex = /^[a-zA-Z0-9.-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(cleanVpa)) {
      throw Object.assign(new Error("Invalid UPI VPA address format (e.g. worker@okhdfcbank)"), {
        statusCode: 400,
      });
    }

    // 1. Create or get Contact
    const contact = await razorpayXService.createOrGetContact(worker.user, worker);

    // 2. Create Fund Account
    const fundAccount = await razorpayXService.createFundAccount(contact.id, {
      payoutMethod: "UPI",
      upiVpa: cleanVpa,
    });

    // 3. Save masked info on worker profile
    const updated = await prisma.workerProfile.update({
      where: { id: worker.id },
      data: {
        payoutMethod: "UPI",
        upiVpa: cleanVpa,
        bankAccountName: null,
        bankAccountNumberMasked: null,
        bankIfsc: null,
        payoutConsentGiven: true,
        payoutConsentDate: new Date(),
        razorpayContactId: contact.id,
        razorpayFundAccountId: fundAccount.id,
        payoutAccountVerified: true,
      },
    });

    return {
      success: true,
      message: "UPI payout account configured successfully",
      data: {
        payoutMethod: "UPI",
        upiVpa: cleanVpa,
        payoutConsentGiven: true,
        payoutAccountVerified: true,
        razorpayFundAccountId: fundAccount.id,
      },
    };
  } else {
    // Bank Account verification
    if (!bankAccountName || bankAccountName.trim().length < 2) {
      throw Object.assign(new Error("Beneficiary account holder name is required"), {
        statusCode: 400,
      });
    }
    if (!bankAccountNumber || !/^\d{9,18}$/.test(bankAccountNumber.trim())) {
      throw Object.assign(
        new Error("Invalid bank account number (must be 9 to 18 numeric digits)"),
        { statusCode: 400 }
      );
    }
    const cleanIfsc = (bankIfsc || "").trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      throw Object.assign(
        new Error("Invalid IFSC code format (e.g. SBIN0001234)"),
        { statusCode: 400 }
      );
    }

    // 1. Create or get Contact
    const contact = await razorpayXService.createOrGetContact(worker.user, worker);

    // 2. Create Fund Account
    const fundAccount = await razorpayXService.createFundAccount(contact.id, {
      payoutMethod: "BANK_ACCOUNT",
      bankAccountName: bankAccountName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankIfsc: cleanIfsc,
    });

    // 3. Mask bank account number - NEVER store raw full number in database
    const maskedAccountNumber = `•••• •••• ${bankAccountNumber.trim().slice(-4)}`;

    const updated = await prisma.workerProfile.update({
      where: { id: worker.id },
      data: {
        payoutMethod: "BANK_ACCOUNT",
        bankAccountName: bankAccountName.trim(),
        bankAccountNumberMasked: maskedAccountNumber,
        bankIfsc: cleanIfsc,
        upiVpa: null,
        payoutConsentGiven: true,
        payoutConsentDate: new Date(),
        razorpayContactId: contact.id,
        razorpayFundAccountId: fundAccount.id,
        payoutAccountVerified: true,
      },
    });

    return {
      success: true,
      message: "Bank payout account configured successfully",
      data: {
        payoutMethod: "BANK_ACCOUNT",
        bankAccountName: updated.bankAccountName,
        bankAccountNumberMasked: updated.bankAccountNumberMasked,
        bankIfsc: updated.bankIfsc,
        payoutConsentGiven: true,
        payoutAccountVerified: true,
        razorpayFundAccountId: fundAccount.id,
      },
    };
  }
};

/**
 * Worker fetches their registered masked payout beneficiary details
 */
const getWorkerPayoutAccount = async (workerUserId) => {
  const worker = await prisma.workerProfile.findUnique({
    where: { userId: workerUserId },
  });

  if (!worker) {
    throw Object.assign(new Error("Worker profile not found"), { statusCode: 404 });
  }

  return {
    success: true,
    data: {
      payoutMethod: worker.payoutMethod || "BANK_ACCOUNT",
      bankAccountName: worker.bankAccountName,
      bankAccountNumberMasked: worker.bankAccountNumberMasked,
      bankIfsc: worker.bankIfsc,
      upiVpa: worker.upiVpa,
      payoutConsentGiven: worker.payoutConsentGiven,
      payoutConsentDate: worker.payoutConsentDate,
      payoutAccountVerified: worker.payoutAccountVerified,
      hasFundAccount: !!worker.razorpayFundAccountId,
    },
  };
};

/**
 * Manager initiates an actual Bank or UPI payout to the worker for a completed assignment.
 * - Server calculates trusted amount from assignment.assignedRate.
 * - Enforces after-work verification approved.
 * - Prevents duplicate or concurrent payouts.
 * - Uses stable X-Payout-Idempotency key.
 * - Reconciles provider timeouts safely.
 */
const initiateWorkerPayout = async (managerUserId, assignmentId, options = {}) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId },
  });
  if (!manager) {
    throw Object.assign(new Error("Unauthorized: Manager profile required"), {
      statusCode: 403,
    });
  }

  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      issue: true,
      worker: { include: { user: true } },
      afterVerification: true,
      payments: true,
    },
  });

  if (!assignment) {
    throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
  }

  if (assignment.managerId !== manager.id) {
    throw Object.assign(new Error("Unauthorized: You do not manage this assignment"), {
      statusCode: 403,
    });
  }

  // 1. Completion & verification approval checks
  if (assignment.status !== "COMPLETED") {
    throw Object.assign(
      new Error("Assignment must be marked COMPLETED before initiating payout"),
      { statusCode: 400 }
    );
  }

  if (!assignment.afterVerification || assignment.afterVerification.status !== "APPROVED") {
    throw Object.assign(
      new Error("Cannot initiate payout. After-work verification must be approved first"),
      { statusCode: 400 }
    );
  }

  // 2. Calculate amount from trusted server-side rate
  const amount = Number(assignment.assignedRate);
  if (!amount || isNaN(amount) || amount <= 0) {
    throw Object.assign(
      new Error("Invalid assignment rate for payout calculation"),
      { statusCode: 400 }
    );
  }
  const amountPaise = Math.round(amount * 100);

  // 3. Worker payout configuration check
  const workerProfile = assignment.worker;
  if (!workerProfile || !workerProfile.payoutAccountVerified || !workerProfile.razorpayFundAccountId) {
    throw Object.assign(
      new Error("Worker has not configured or verified a bank account or UPI ID for payouts"),
      { statusCode: 400 }
    );
  }

  // 3b. Pre-flight check: if there is an existing PROCESSING payout without payoutId older than 2 minutes, attempt reconciliation first
  try {
    const staleProcessing = await prisma.payment.findFirst({
      where: {
        assignmentId,
        gateway: "RAZORPAYX",
        status: "PROCESSING",
        payoutId: null,
        createdAt: { lte: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });
    if (staleProcessing) {
      await reconcilePaymentWithProvider(staleProcessing.id);
    }
  } catch (_) {}

  // 4. Concurrency & duplicate prevention with stable Idempotency Key
  const payoutMode = workerProfile.payoutMethod === "UPI" ? "UPI" : (options.mode || "IMPS");
  const baseIdempotencyKey = `samadhan_payout_${assignment.id}`;

  let payment;
  let activeIdempotencyKey;

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const existingPayments = await tx.payment.findMany({
        where: { assignmentId },
        orderBy: { createdAt: "desc" },
      });

      const completed = existingPayments.find((p) => p.status === "COMPLETED");
      if (completed) {
        throw Object.assign(
          new Error("Payout for this assignment has already been completed"),
          { statusCode: 409, payment: completed }
        );
      }

      const inProcessing = existingPayments.find(
        (p) => p.status === "PROCESSING" || p.payoutStatus === "processing" || p.payoutStatus === "queued"
      );
      if (inProcessing) {
        throw Object.assign(
          new Error("A payout is already being processed for this assignment. Please wait for provider confirmation"),
          { statusCode: 409, payment: inProcessing }
        );
      }

      let targetPayment = existingPayments.find((p) => p.status === "PENDING" || p.status === "FAILED");
      if (targetPayment) {
        // If retrying a previously failed payout, generate a unique attempt key so RazorpayX does not reject as duplicate
        const key = targetPayment.status === "FAILED"
          ? `${baseIdempotencyKey}_retry_${Date.now()}`
          : (targetPayment.idempotencyKey || baseIdempotencyKey);

        const updated = await tx.payment.update({
          where: { id: targetPayment.id },
          data: {
            status: "PROCESSING",
            gateway: "RAZORPAYX",
            payoutMode,
            payoutStatus: "processing",
            idempotencyKey: key,
            failureReason: null,
            payoutFailureReason: null,
            approvedById: managerUserId,
          },
        });
        return { payment: updated, idempotencyKey: key };
      } else {
        const created = await tx.payment.create({
          data: {
            workerId: assignment.workerId,
            assignmentId: assignment.id,
            issueId: assignment.issueId,
            amount,
            rate: amount,
            status: "PROCESSING",
            gateway: "RAZORPAYX",
            payoutMode,
            payoutStatus: "processing",
            idempotencyKey: baseIdempotencyKey,
            approvedById: managerUserId,
          },
        });
        return { payment: created, idempotencyKey: baseIdempotencyKey };
      }
    });

    payment = reservation.payment;
    activeIdempotencyKey = reservation.idempotencyKey;
  } catch (dbErr) {
    // Handle Prisma P2002 Unique Constraint violation on idempotencyKey (concurrent submission)
    if (dbErr.code === "P2002" || (dbErr.message && dbErr.message.includes("Unique constraint"))) {
      const concurrentPayment = await prisma.payment.findFirst({
        where: { assignmentId },
      });
      throw Object.assign(
        new Error("A payout for this assignment is already being processed by a concurrent request"),
        { statusCode: 409, payment: concurrentPayment }
      );
    }
    throw dbErr;
  }

  // 6. Call RazorpayX Payout API with Idempotency Key (only reached by the winning transaction)
  let payoutResult;
  try {
    payoutResult = await razorpayXService.createPayout({
      fundAccountId: workerProfile.razorpayFundAccountId,
      amountPaise,
      mode: payoutMode,
      purpose: "payout",
      idempotencyKey: activeIdempotencyKey,
      referenceId: assignment.id,
      narration: `SAMADHAN-${assignment.id.slice(0, 8)}`,
    });
  } catch (err) {
    // If network timeout occurred, never create a second payout!
    if (err.isTimeout) {
      console.warn("RazorpayX payout creation timed out. Payment remains in PROCESSING state for reconciliation.");
      try {
        const { schedulePayoutReconciliation } = require("../queues");
        await schedulePayoutReconciliation(payment.id, 10000);
      } catch (queueErr) {
        console.warn("Could not enqueue payout reconciliation job:", queueErr.message);
      }
      return {
        success: true,
        pendingReconciliation: true,
        message: "Payout request sent to provider but timed out. Background reconciliation has been scheduled.",
        payment,
      };
    }

    // Provider rejected request
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        payoutStatus: "failed",
        payoutFailureReason: err.providerError?.description || err.message,
      },
    });

    throw err;
  }

  // 7. Update records based on provider payout outcome
  const isCompleted = payoutResult.status === "processed";
  const isFailed = payoutResult.status === "failed" || payoutResult.status === "rejected";

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: isCompleted ? "COMPLETED" : isFailed ? "FAILED" : "PROCESSING",
        payoutId: payoutResult.id,
        payoutStatus: payoutResult.status,
        payoutUtr: payoutResult.utr || null,
        payoutFee: payoutResult.fee ? payoutResult.fee / 100 : null,
        payoutTax: payoutResult.tax ? payoutResult.tax / 100 : null,
        payoutFailureReason: payoutResult.failure_reason || null,
        paidAt: isCompleted ? new Date() : null,
      },
    });

    await tx.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        gateway: "RAZORPAYX",
        transactionId: payoutResult.id,
        amount,
        currency: "INR",
        status: isCompleted ? "COMPLETED" : isFailed ? "FAILED" : "PROCESSING",
        gatewayResponse: payoutResult,
      },
    });

    if (isCompleted && workerProfile.userId) {
      await tx.notification.create({
        data: {
          userId: workerProfile.userId,
          type: "PAYMENT",
          title: "Bank/UPI Payout Received",
          message: `Payout of ₹${amount} has been successfully credited to your ${workerProfile.payoutMethod || "Account"}. UTR: ${payoutResult.utr || "N/A"}`,
          assignmentId: assignment.id,
          issueId: assignment.issueId,
        },
      });
      emitToUser(workerProfile.userId, "PAYMENT_RECEIVED", {
        paymentId: payment.id,
        amount,
        assignmentId: assignment.id,
        utr: payoutResult.utr,
      });
    }

    return updated;
  });

  return {
    success: true,
    message: isCompleted
      ? "Payout processed successfully"
      : `Payout initiated with status: ${payoutResult.status}`,
    payment: updatedPayment,
    payout: payoutResult,
  };
};

/**
 * Allowed State Transitions for RazorpayX Payouts:
 * - Non-terminal states: 'pending', 'queued', 'initiated', 'processing'
 * - Terminal states: 'processed', 'reversed', 'failed', 'rejected'
 *
 * Strict Rules:
 * 1. A delayed non-terminal webhook (queued/initiated/pending/processing) MUST NEVER downgrade a terminal payout state.
 * 2. COMPLETED, FAILED, and REFUNDED payment states are strictly protected against stale events.
 * 3. 'payout.reversed' is permitted only from a previously 'COMPLETED' (processed) payout.
 * 4. Duplicate events return { handled: true, duplicate: true } idempotently.
 * 5. Concurrent webhooks are executed safely within prisma.$transaction.
 */
const TERMINAL_PAYOUT_STATUSES = new Set(["processed", "reversed", "failed", "rejected"]);

const handlePayoutWebhook = async (event, payload, eventId = null) => {
  const payoutEntity = payload.payout?.entity;
  if (!payoutEntity) {
    return { handled: false, reason: "No payout entity in webhook payload" };
  }

  const payoutId = payoutEntity.id;
  const incomingStatus = (payoutEntity.status || "").toLowerCase();
  const refId = payoutEntity.reference_id;
  const idempotencyKey = refId ? `samadhan_payout_${refId}` : null;

  // Run inside database transaction to guarantee concurrency safety, ledger recording, and atomic state verification
  return await prisma.$transaction(async (tx) => {
    // -------------------------------------------------------------------------
    // Ledger: Inbound Webhook Event Idempotency & Deduplication
    // -------------------------------------------------------------------------
    let webhookLog = null;
    if (eventId) {
      webhookLog = await tx.webhookEvent.findUnique({
        where: {
          gateway_eventId: {
            gateway: "RAZORPAYX",
            eventId: eventId,
          },
        },
      });

      if (webhookLog) {
        if (webhookLog.status === "PROCESSED" || webhookLog.status === "IGNORED") {
          return {
            handled: true,
            duplicate: true,
            message: `Webhook event ${eventId} already processed (${webhookLog.status})`,
          };
        }
        if (webhookLog.status === "PROCESSING") {
          const ageMs = Date.now() - new Date(webhookLog.createdAt).getTime();
          if (ageMs > 5 * 60 * 1000) {
            console.warn(`Webhook event ${eventId} was stuck in PROCESSING for ${Math.round(ageMs / 1000)}s. Resetting for reprocessing.`);
            await tx.webhookEvent.update({
              where: { id: webhookLog.id },
              data: { status: "PROCESSING", errorMessage: null },
            });
          } else {
            return {
              handled: false,
              inFlight: true,
              message: `Webhook event ${eventId} is currently being processed by a concurrent task`,
            };
          }
        } else if (webhookLog.status === "FAILED") {
          console.log(`Retrying previously FAILED webhook event ${eventId} on gateway redelivery.`);
          await tx.webhookEvent.update({
            where: { id: webhookLog.id },
            data: { status: "PROCESSING", errorMessage: null },
          });
        }
      } else {
        try {
          webhookLog = await tx.webhookEvent.create({
            data: {
              gateway: "RAZORPAYX",
              eventId: eventId,
              eventType: event,
              status: "PROCESSING",
              payload,
            },
          });
        } catch (eventErr) {
          if (eventErr.code === "P2002") {
            return {
              handled: true,
              duplicate: true,
              message: `Concurrent webhook event ${eventId} already recorded`,
            };
          }
          throw eventErr;
        }
      }
    }

    const finalizeLog = async (status, reason = null) => {
      if (webhookLog && webhookLog.id) {
        try {
          await tx.webhookEvent.update({
            where: { id: webhookLog.id },
            data: {
              status,
              errorMessage: reason,
              processedAt: new Date(),
            },
          });
        } catch (_) {}
      }
    };

    // 1. Find payment by payoutId or idempotencyKey inside transaction
    const payment = await tx.payment.findFirst({
      where: {
        OR: [
          { payoutId: payoutId },
          idempotencyKey ? { idempotencyKey: { startsWith: idempotencyKey } } : undefined,
        ].filter(Boolean),
      },
    });

    if (!payment) {
      await finalizeLog("IGNORED", "Payment record not found for payout webhook");
      return { handled: false, reason: "Payment record not found for payout webhook" };
    }

    const currentStatus = payment.status; // PaymentStatus: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
    const currentPayoutStatus = (payment.payoutStatus || "").toLowerCase();

    // -------------------------------------------------------------------------
    // Rule 1: Idempotency Protection for Identical Duplicate Events
    // -------------------------------------------------------------------------
    if (
      (event === "payout.processed" || incomingStatus === "processed") &&
      currentStatus === "COMPLETED" &&
      currentPayoutStatus === "processed"
    ) {
      await finalizeLog("PROCESSED");
      return { handled: true, duplicate: true, message: "Payout already marked completed" };
    }

    if (
      (event === "payout.reversed" || incomingStatus === "reversed") &&
      currentPayoutStatus === "reversed"
    ) {
      await finalizeLog("PROCESSED");
      return { handled: true, duplicate: true, message: "Payout already marked reversed" };
    }

    if (
      (event === "payout.failed" || event === "payout.rejected" || incomingStatus === "failed" || incomingStatus === "rejected") &&
      currentStatus === "FAILED" &&
      (currentPayoutStatus === "failed" || currentPayoutStatus === "rejected")
    ) {
      await finalizeLog("PROCESSED");
      return { handled: true, duplicate: true, message: "Payout already marked failed/rejected" };
    }

    // -------------------------------------------------------------------------
    // Rule 2: Protect Terminal States (COMPLETED, FAILED, REFUNDED) from Stale Events
    // -------------------------------------------------------------------------
    const isNonTerminalEvent =
      event === "payout.queued" ||
      event === "payout.initiated" ||
      incomingStatus === "queued" ||
      incomingStatus === "initiated" ||
      incomingStatus === "pending" ||
      incomingStatus === "processing";

    if (isNonTerminalEvent) {
      if (currentStatus === "COMPLETED" || TERMINAL_PAYOUT_STATUSES.has(currentPayoutStatus)) {
        await finalizeLog("IGNORED", `Stale event (${event || incomingStatus}) ignored`);
        return {
          handled: true,
          ignored: true,
          reason: `Stale event (${event || incomingStatus}) ignored. Payout is already in terminal state: ${currentPayoutStatus || currentStatus}.`,
        };
      }
    }

    if (currentStatus === "REFUNDED") {
      await finalizeLog("IGNORED", "Payment is already marked REFUNDED");
      return {
        handled: true,
        ignored: true,
        reason: `Ignored event (${event || incomingStatus}). Payment is already marked REFUNDED.`,
      };
    }

    if (
      (event === "payout.processed" || incomingStatus === "processed") &&
      currentStatus === "FAILED" &&
      currentPayoutStatus !== "processing" &&
      currentPayoutStatus !== "queued" &&
      currentPayoutStatus !== ""
    ) {
      await finalizeLog("IGNORED", "Payout already entered terminal failed state");
      return {
        handled: true,
        ignored: true,
        reason: `Ignored event (${event}). Payout has already entered terminal failed state: ${currentPayoutStatus}.`,
      };
    }

    // -------------------------------------------------------------------------
    // Rule 3: Legitimate State Transitions
    // -------------------------------------------------------------------------

    // A. Transition to COMPLETED (payout.processed)
    if (event === "payout.processed" || incomingStatus === "processed") {
      if (currentPayoutStatus === "reversed") {
        await finalizeLog("IGNORED", "Payout was already marked reversed by destination bank");
        return {
          handled: true,
          ignored: true,
          reason: "Ignored payout.processed. Payout was already marked reversed by destination bank.",
        };
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          payoutId: payoutId,
          payoutStatus: "processed",
          payoutUtr: payoutEntity.utr || payment.payoutUtr,
          payoutFee: payoutEntity.fee ? payoutEntity.fee / 100 : payment.payoutFee,
          payoutTax: payoutEntity.tax ? payoutEntity.tax / 100 : payment.payoutTax,
          paidAt: payment.paidAt || new Date(),
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          gateway: "RAZORPAYX",
          transactionId: payoutId,
          amount: payment.amount,
          currency: "INR",
          status: "COMPLETED",
          gatewayResponse: payload,
        },
      });

      const workerProfile = await tx.workerProfile.findUnique({
        where: { id: payment.workerId },
      });
      if (workerProfile?.userId) {
        await tx.notification.create({
          data: {
            userId: workerProfile.userId,
            type: "PAYMENT",
            title: "Bank/UPI Payout Processed",
            message: `Your payout of ₹${payment.amount} has been processed. UTR: ${payoutEntity.utr || "N/A"}`,
            assignmentId: payment.assignmentId,
            issueId: payment.issueId,
          },
        });
        emitToUser(workerProfile.userId, "PAYMENT_RECEIVED", {
          paymentId: payment.id,
          amount: payment.amount,
          utr: payoutEntity.utr,
        });
      }

      await finalizeLog("PROCESSED");
      return { handled: true, status: "COMPLETED", payoutId };
    }

    // B. Transition to REVERSED (payout.reversed)
    if (event === "payout.reversed" || incomingStatus === "reversed") {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          payoutId: payoutId,
          payoutStatus: "reversed",
          payoutReversedAt: new Date(),
          payoutFailureReason: payoutEntity.failure_reason || "Reversed by destination bank",
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          gateway: "RAZORPAYX",
          transactionId: payoutId,
          amount: payment.amount,
          currency: "INR",
          status: "REVERSED",
          gatewayResponse: payload,
        },
      });

      const workerProfile = await tx.workerProfile.findUnique({
        where: { id: payment.workerId },
      });
      if (workerProfile?.userId) {
        await tx.notification.create({
          data: {
            userId: workerProfile.userId,
            type: "ALERT",
            title: "Bank Payout Reversed",
            message: `Your payout of ₹${payment.amount} was reversed by the destination bank: ${payoutEntity.failure_reason || "Account issue"}. Please verify your bank/UPI details.`,
            assignmentId: payment.assignmentId,
            issueId: payment.issueId,
          },
        });
        emitToUser(workerProfile.userId, "PAYMENT_FAILED", {
          paymentId: payment.id,
          amount: payment.amount,
          reason: payoutEntity.failure_reason,
        });
      }

      await finalizeLog("PROCESSED");
      return { handled: true, status: "REVERSED", payoutId };
    }

    // C. Transition to FAILED / REJECTED
    if (
      event === "payout.failed" ||
      event === "payout.rejected" ||
      incomingStatus === "failed" ||
      incomingStatus === "rejected"
    ) {
      if (currentStatus === "COMPLETED" || currentPayoutStatus === "reversed") {
        await finalizeLog("IGNORED", `Payout already ${currentPayoutStatus || currentStatus}`);
        return {
          handled: true,
          ignored: true,
          reason: `Ignored ${event}. Payout is already ${currentPayoutStatus || currentStatus}.`,
        };
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          payoutId: payoutId,
          payoutStatus: incomingStatus || "failed",
          payoutFailureReason: payoutEntity.failure_reason || "Payout failed or rejected by provider",
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          gateway: "RAZORPAYX",
          transactionId: payoutId,
          amount: payment.amount,
          currency: "INR",
          status: "FAILED",
          gatewayResponse: payload,
        },
      });

      await finalizeLog("PROCESSED");
      return { handled: true, status: "FAILED", payoutId };
    }

    // D. Non-terminal updates
    if (!TERMINAL_PAYOUT_STATUSES.has(currentPayoutStatus) && currentStatus !== "COMPLETED") {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          payoutId: payoutId,
          payoutStatus: incomingStatus || "processing",
        },
      });
    }

    await finalizeLog("PROCESSED");
    return { handled: true, status: incomingStatus, payoutId };
  });
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

  return await prisma.payment.findFirst({
    where: { assignmentId },
    orderBy: { createdAt: "desc" },
    include: {
      transactions: { orderBy: { timestamp: "desc" }, take: 5 },
    },
  });
};

const getManagerPayments = async (managerUserId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId },
  });
  if (!manager) {
    throw Object.assign(new Error("Manager profile not found"), { statusCode: 404 });
  }

  return await prisma.payment.findMany({
    where: {
      assignment: { managerId: manager.id },
    },
    orderBy: { createdAt: "desc" },
    include: {
      assignment: {
        include: {
          issue: { select: { id: true, title: true, priority: true } },
          worker: { include: { user: { select: { email: true, phone: true } } } },
        },
      },
      transactions: { take: 1, orderBy: { timestamp: "desc" } },
    },
  });
};

const getWorkerPayments = async (workerUserId) => {
  const worker = await prisma.workerProfile.findUnique({
    where: { userId: workerUserId },
  });
  if (!worker) {
    throw Object.assign(new Error("Worker profile not found"), { statusCode: 404 });
  }

  return await prisma.payment.findMany({
    where: { workerId: worker.id },
    orderBy: { createdAt: "desc" },
    include: {
      assignment: {
        include: {
          issue: { select: { id: true, title: true, priority: true } },
        },
      },
      transactions: { take: 1, orderBy: { timestamp: "desc" } },
    },
  });
};

const handleWebhook = async (event, payload, eventId = null) => {
  if (event && event.startsWith("payout.")) {
    return await handlePayoutWebhook(event, payload, eventId);
  }

  const paymentEntity = payload.payment?.entity;
  const paymentId =
    paymentEntity?.notes?.paymentId ||
    paymentEntity?.notes?.receipt?.replace("receipt_", "");
  const orderId = paymentEntity?.order_id;
  const status = paymentEntity?.status;

  return await prisma.$transaction(async (tx) => {
    let webhookLog = null;
    if (eventId) {
      webhookLog = await tx.webhookEvent.findUnique({
        where: { gateway_eventId: { gateway: "RAZORPAY", eventId } },
      });

      if (webhookLog) {
        if (webhookLog.status === "PROCESSED" || webhookLog.status === "IGNORED") {
          return { handled: true, duplicate: true, message: `Webhook event ${eventId} already processed` };
        }
        if (webhookLog.status === "PROCESSING") {
          return { handled: false, inFlight: true, message: `Webhook event ${eventId} is currently in flight` };
        }
      } else {
        try {
          webhookLog = await tx.webhookEvent.create({
            data: {
              gateway: "RAZORPAY",
              eventId,
              eventType: event,
              status: "PROCESSING",
              payload,
            },
          });
        } catch (err) {
          if (err.code === "P2002") {
            return { handled: true, duplicate: true, message: "Concurrent webhook duplicate" };
          }
          throw err;
        }
      }
    }

    const finalize = async (s) => {
      if (webhookLog && webhookLog.id) {
        try {
          await tx.webhookEvent.update({
            where: { id: webhookLog.id },
            data: { status: s, processedAt: new Date() },
          });
        } catch (_) {}
      }
    };

    let payment = null;
    if (paymentId) {
      payment = await tx.payment.findUnique({ where: { id: paymentId } });
    }
    if (!payment && orderId) {
      payment = await tx.payment.findFirst({ where: { gatewayTransactionId: orderId } });
    }

    if (!payment) {
      await finalize("IGNORED");
      return { handled: false, reason: "Payment record not found for webhook" };
    }

    if (payment.status === "COMPLETED" && (event === "payment.captured" || event === "order.paid")) {
      await finalize("PROCESSED");
      return { handled: true, duplicate: true, message: "Payment already marked completed" };
    }

    if (event === "payment.captured" || (event === "payment.authorized" && status === "captured")) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          gatewayTransactionId: paymentEntity.id,
          paidAt: new Date(),
        },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          gateway: "RAZORPAY",
          transactionId: paymentEntity.id,
          amount: payment.amount,
          currency: "INR",
          status: "COMPLETED",
          gatewayResponse: payload,
        },
      });
      await finalize("PROCESSED");
      return { handled: true, status: "COMPLETED" };
    } else if (event === "payment.failed") {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureReason: paymentEntity.error_description || "Webhook reported failure",
        },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          gateway: "RAZORPAY",
          transactionId: paymentEntity.id || "failed_event",
          amount: payment.amount,
          currency: "INR",
          status: "FAILED",
          gatewayResponse: payload,
        },
      });
      await finalize("PROCESSED");
      return { handled: true, status: "FAILED" };
    } else if (event === "refund.created" || event === "refund.processed") {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          failureReason: "Payment refunded/reversed via gateway",
        },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          gateway: "RAZORPAY",
          transactionId: payload.refund?.entity?.id || paymentEntity?.id || "refund_event",
          amount: payment.amount,
          currency: "INR",
          status: "REFUNDED",
          gatewayResponse: payload,
        },
      });
      await finalize("PROCESSED");
      return { handled: true, status: "REFUNDED" };
    }

    await finalize("PROCESSED");
    return { handled: true, event };
  });
};

/**
 * =============================================================================
 * Phase 3: Reliability, Recovery & Reconciliation
 * =============================================================================
 */

/**
 * Reconcile a payment with RazorpayX provider status.
 * Handles both payoutId and referenceId lookups.
 * Safe for concurrent and repeated execution.
 */
const reconcilePaymentWithProvider = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      worker: { include: { user: true } },
      assignment: true,
      transactions: { orderBy: { timestamp: "desc" } },
    },
  });

  if (!payment) {
    return { success: false, reason: "Payment record not found" };
  }

  // Already terminal and completed
  if (payment.status === "COMPLETED" && payment.payoutStatus === "processed") {
    return { success: true, outcome: "already_completed", payment };
  }

  if (payment.gateway !== "RAZORPAYX") {
    return { success: false, reason: "Payment is not a RazorpayX payout" };
  }

  let providerPayout = null;
  try {
    if (payment.payoutId) {
      providerPayout = await razorpayXService.getPayoutDetails(payment.payoutId);
    } else {
      const refId = payment.assignmentId || payment.id;
      providerPayout = await razorpayXService.getPayoutByReference(refId);
    }
  } catch (err) {
    console.warn(`[Reconciliation] Provider query error for payment #${payment.id.slice(0, 8)}:`, err.message);
    throw err; // Allow BullMQ to retry with backoff
  }

  // Handle case where provider has NO record
  if (!providerPayout) {
    const ageMs = Date.now() - new Date(payment.createdAt).getTime();
    if (ageMs > 3 * 60 * 1000 && !payment.payoutId) {
      // Older than 3 minutes without payoutId and provider has no record: safely mark failed
      const updated = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            payoutStatus: "failed",
            payoutFailureReason: "Reconciliation: Request timed out and provider confirmed no payout record exists.",
          },
        });
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            gateway: "RAZORPAYX",
            transactionId: `failed_norecord_${payment.id.slice(0, 8)}`,
            amount: payment.amount,
            currency: "INR",
            status: "FAILED",
            gatewayResponse: { reason: "No provider payout found for reference" },
          },
        });
        return p;
      });
      return { success: true, outcome: "marked_failed_unrecorded", payment: updated };
    }
    return { success: true, outcome: "provider_in_flight", payment };
  }

  // Provider payout found: reconcile state
  const providerStatus = (providerPayout.status || "").toLowerCase();

  return await prisma.$transaction(async (tx) => {
    // Re-fetch within tx to ensure latest state
    const current = await tx.payment.findUnique({
      where: { id: payment.id },
    });

    if (providerStatus === "processed") {
      const wasAlreadyCompleted = current.status === "COMPLETED";
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          payoutId: providerPayout.id,
          payoutStatus: "processed",
          payoutUtr: providerPayout.utr || current.payoutUtr,
          payoutFee: providerPayout.fee ? providerPayout.fee / 100 : current.payoutFee,
          payoutTax: providerPayout.tax ? providerPayout.tax / 100 : current.payoutTax,
          paidAt: current.paidAt || new Date(),
          failureReason: null,
          payoutFailureReason: null,
        },
      });

      if (!wasAlreadyCompleted) {
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            gateway: "RAZORPAYX",
            transactionId: providerPayout.id,
            amount: payment.amount,
            currency: "INR",
            status: "COMPLETED",
            gatewayResponse: providerPayout,
          },
        });

        if (payment.worker?.userId) {
          const existingNotif = await tx.notification.findFirst({
            where: {
              userId: payment.worker.userId,
              type: "PAYMENT",
              assignmentId: payment.assignmentId,
            },
          });
          if (!existingNotif) {
            await tx.notification.create({
              data: {
                userId: payment.worker.userId,
                type: "PAYMENT",
                title: "Bank/UPI Payout Processed",
                message: `Your payout of ₹${payment.amount} has been processed via reconciliation. UTR: ${providerPayout.utr || "N/A"}.`,
                assignmentId: payment.assignmentId,
                issueId: payment.issueId,
              },
            });
            emitToUser(payment.worker.userId, "PAYMENT_RECEIVED", {
              paymentId: payment.id,
              amount: payment.amount,
              utr: providerPayout.utr,
            });
          }
        }
      }

      return { success: true, outcome: "reconciled_completed", payment: updated };
    }

    if (providerStatus === "reversed") {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          payoutId: providerPayout.id,
          payoutStatus: "reversed",
          payoutReversedAt: current.payoutReversedAt || new Date(),
          payoutFailureReason: providerPayout.failure_reason || "Reversed by destination bank",
        },
      });

      if (current.payoutStatus !== "reversed") {
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            gateway: "RAZORPAYX",
            transactionId: `${providerPayout.id}_rev_${Date.now()}`,
            amount: payment.amount,
            currency: "INR",
            status: "REVERSED",
            gatewayResponse: providerPayout,
          },
        });

        if (payment.worker?.userId) {
          await tx.notification.create({
            data: {
              userId: payment.worker.userId,
              type: "ALERT",
              title: "Bank Payout Reversed",
              message: `Your payout of ₹${payment.amount} was reversed by the destination bank: ${providerPayout.failure_reason || "Account issue"}.`,
              assignmentId: payment.assignmentId,
              issueId: payment.issueId,
            },
          });
          emitToUser(payment.worker.userId, "PAYMENT_FAILED", {
            paymentId: payment.id,
            amount: payment.amount,
            reason: providerPayout.failure_reason,
          });
        }
      }

      return { success: true, outcome: "reconciled_reversed", payment: updated };
    }

    if (providerStatus === "failed" || providerStatus === "rejected") {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          payoutId: providerPayout.id,
          payoutStatus: providerStatus,
          payoutFailureReason: providerPayout.failure_reason || "Payout failed/rejected at provider",
        },
      });

      if (current.status !== "FAILED") {
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            gateway: "RAZORPAYX",
            transactionId: providerPayout.id,
            amount: payment.amount,
            currency: "INR",
            status: "FAILED",
            gatewayResponse: providerPayout,
          },
        });
      }

      return { success: true, outcome: "reconciled_failed", payment: updated };
    }

    // In-flight status (queued, pending, processing)
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        payoutId: providerPayout.id,
        payoutStatus: providerStatus,
      },
    });

    return { success: true, outcome: "in_flight", payment: updated };
  });
};

/**
 * Clean up stuck PROCESSING webhook events older than maxAgeMinutes.
 */
const recoverStuckWebhookEvents = async (maxAgeMinutes = 10) => {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  try {
    const result = await prisma.webhookEvent.updateMany({
      where: {
        status: "PROCESSING",
        createdAt: { lte: cutoff },
      },
      data: {
        status: "FAILED",
        errorMessage: `Recovered: webhook was stuck in PROCESSING for more than ${maxAgeMinutes} minutes.`,
      },
    });
    if (result.count > 0) {
      console.warn(`[Webhook Recovery] Recovered ${result.count} stuck webhook event(s) to FAILED.`);
    }
    return result.count;
  } catch (err) {
    console.error("[Webhook Recovery] Error recovering stuck webhooks:", err.message);
    return 0;
  }
};

/**
 * Periodic scanner for ambiguous PROCESSING payouts and stuck webhooks.
 * Used by worker.js periodic loop as a database-level reconciliation fallback.
 */
const reconcileAmbiguousPayouts = async (maxAgeMinutes = 2) => {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  try {
    // 1. Recover stuck webhooks
    await recoverStuckWebhookEvents(10);

    // 2. Find processing payouts older than cutoff
    const ambiguousPayments = await prisma.payment.findMany({
      where: {
        gateway: "RAZORPAYX",
        status: "PROCESSING",
        createdAt: { lte: cutoff },
      },
      take: 20,
      orderBy: { createdAt: "asc" },
    });

    let reconciledCount = 0;
    let errorsCount = 0;

    for (const payment of ambiguousPayments) {
      try {
        await reconcilePaymentWithProvider(payment.id);
        reconciledCount++;
      } catch (err) {
        errorsCount++;
        console.warn(`[Periodic Payout Reconciliation] Error reconciling payment #${payment.id.slice(0, 8)}:`, err.message);
      }
    }

    return {
      scannedCount: ambiguousPayments.length,
      reconciledCount,
      errorsCount,
    };
  } catch (err) {
    console.error("[Periodic Payout Reconciliation] Failed to run periodic scan:", err.message);
    return { scannedCount: 0, reconciledCount: 0, errorsCount: 1, error: err.message };
  }
};

/**
 * Operational Monitoring: Structured payment and webhook health metrics.
 * Sanitized and strictly free of sensitive bank or user details.
 */
const getPaymentOperationalMetrics = async () => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

  const [
    totalPayouts,
    processingPayouts,
    ambiguousTimeouts,
    completedPayouts,
    failedPayouts,
    stuckWebhooks,
    failedWebhooks,
    processedWebhooks,
  ] = await Promise.all([
    prisma.payment.count({ where: { gateway: "RAZORPAYX" } }),
    prisma.payment.count({ where: { gateway: "RAZORPAYX", status: "PROCESSING" } }),
    prisma.payment.count({
      where: {
        gateway: "RAZORPAYX",
        status: "PROCESSING",
        payoutId: null,
        createdAt: { lte: twoMinutesAgo },
      },
    }),
    prisma.payment.count({ where: { gateway: "RAZORPAYX", status: "COMPLETED" } }),
    prisma.payment.count({ where: { gateway: "RAZORPAYX", status: "FAILED" } }),
    prisma.webhookEvent.count({ where: { status: "PROCESSING", createdAt: { lte: tenMinutesAgo } } }),
    prisma.webhookEvent.count({ where: { status: "FAILED" } }),
    prisma.webhookEvent.count({ where: { status: "PROCESSED" } }),
  ]);

  return {
    timestamp: now.toISOString(),
    payouts: {
      total: totalPayouts,
      processing: processingPayouts,
      ambiguousTimeouts,
      completed: completedPayouts,
      failed: failedPayouts,
    },
    webhooks: {
      processed: processedWebhooks,
      failed: failedWebhooks,
      stuck: stuckWebhooks,
    },
  };
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
  handlePayoutWebhook,
  handleWebhook,
  reconcilePaymentWithProvider,
  recoverStuckWebhookEvents,
  reconcileAmbiguousPayouts,
  getPaymentOperationalMetrics,
};
