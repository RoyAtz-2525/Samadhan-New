/**
 * Background job to reconcile in-flight, processing, or ambiguous payout states with RazorpayX.
 */
async function handlePayoutReconciliation(job) {
  const { paymentId } = job.data || {};

  if (!paymentId) {
    console.warn(
      `[Job:${job.name}] Missing paymentId in job payload. Skipping.`,
    );
    return { skipped: true, reason: "missing_payment_id" };
  }

  console.log(
    `[Job:${job.name}] Reconciling payout for payment #${paymentId.slice(0, 8)} (Job ID: ${job.id}, attempt: ${job.attemptsMade + 1})...`,
  );

  // Lazy load paymentService to prevent circular dependency
  const paymentService = require("../services/paymentService");

  try {
    const result = await paymentService.reconcilePaymentWithProvider(paymentId);
    console.log(
      `[Job:${job.name}] Reconciled payment #${paymentId.slice(0, 8)} successfully:`,
      {
        status: result?.payment?.status,
        payoutStatus: result?.payment?.payoutStatus,
        outcome: result?.outcome,
      },
    );
    return result;
  } catch (err) {
    console.error(
      `[Job:${job.name}] Error reconciling payment #${paymentId.slice(0, 8)}:`,
      err.message,
    );
    throw err; // Rethrow to allow BullMQ backoff retry
  }
}

module.exports = {
  handlePayoutReconciliation,
};
