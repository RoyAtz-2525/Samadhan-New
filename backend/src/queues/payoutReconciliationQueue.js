const { Queue } = require("bullmq");
const {
  isQueueConfigured,
  getQueueRedisConnection,
} = require("../config/queue");
const { JOB_NAMES } = require("../jobs");

const QUEUE_NAME = "payout-reconciliation";

let payoutReconciliationQueueInstance = null;

const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 10000,
  },
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 500 },
};

/**
 * Get or initialize the Payout Reconciliation queue.
 * Returns null if Redis is not configured or offline.
 *
 * @returns {Queue|null}
 */
function getPayoutReconciliationQueue() {
  if (!isQueueConfigured()) {
    return null;
  }

  if (payoutReconciliationQueueInstance) {
    return payoutReconciliationQueueInstance;
  }

  const connection = getQueueRedisConnection({ isWorker: false });
  if (!connection) {
    return null;
  }

  try {
    payoutReconciliationQueueInstance = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    payoutReconciliationQueueInstance.on("error", (err) => {
      console.warn(`[Queue:${QUEUE_NAME}] Queue error:`, err.message);
    });

    return payoutReconciliationQueueInstance;
  } catch (err) {
    console.warn(`[Queue:${QUEUE_NAME}] Failed to create queue:`, err.message);
    return null;
  }
}

/**
 * Schedule a background payout reconciliation job for an in-flight or ambiguous payout.
 * Uses a stable job ID (payout-recon-${paymentId}) to avoid duplicate concurrent jobs.
 *
 * @param {string} paymentId - Payment UUID
 * @param {number} delayMs - Delay in milliseconds before attempting reconciliation
 * @returns {Promise<void>}
 */
async function schedulePayoutReconciliation(paymentId, delayMs = 15000) {
  if (!paymentId) return;

  const queue = getPayoutReconciliationQueue();
  if (!queue) {
    console.log(
      `[Queue:${QUEUE_NAME}] Redis offline; payout reconciliation for payment #${paymentId.slice(0, 8)} tracked via database reconciliation.`,
    );
    return;
  }

  const stableJobId = `payout-recon-${paymentId}`;

  try {
    const existingJob = await queue.getJob(stableJobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === "delayed" || state === "waiting") {
        console.log(
          `[Queue:${QUEUE_NAME}] Reconciliation job ${stableJobId} already queued (${state}). Skipping duplicate.`,
        );
        return;
      } else if (state === "active") {
        console.log(
          `[Queue:${QUEUE_NAME}] Reconciliation job ${stableJobId} is actively running.`,
        );
        return;
      } else {
        await existingJob.remove().catch(() => {});
      }
    }

    await queue.add(
      JOB_NAMES?.PAYOUT_RECONCILE || "payout:reconcile",
      { paymentId },
      {
        jobId: stableJobId,
        delay: Math.max(0, delayMs),
      },
    );
    console.log(
      `[Queue:${QUEUE_NAME}] Scheduled payout reconciliation for payment #${paymentId.slice(0, 8)} in ${Math.round(delayMs / 1000)}s.`,
    );
  } catch (err) {
    console.warn(
      `[Queue:${QUEUE_NAME}] Failed to schedule reconciliation for #${paymentId.slice(0, 8)}:`,
      err.message,
    );
  }
}

/**
 * Gracefully close the payout reconciliation queue instance.
 */
async function closePayoutReconciliationQueue() {
  if (payoutReconciliationQueueInstance) {
    try {
      await payoutReconciliationQueueInstance.close();
      console.log(`[Queue:${QUEUE_NAME}] Queue closed.`);
    } catch (err) {
      console.warn(`[Queue:${QUEUE_NAME}] Error closing queue:`, err.message);
    }
    payoutReconciliationQueueInstance = null;
  }
}

module.exports = {
  QUEUE_NAME,
  getPayoutReconciliationQueue,
  schedulePayoutReconciliation,
  closePayoutReconciliationQueue,
};
