const { Worker } = require("bullmq");
const {
  isQueueConfigured,
  getQueueRedisConnection,
} = require("../config/queue");
const { QUEUE_NAME } = require("../queues/payoutReconciliationQueue");
const {
  handlePayoutReconciliation,
} = require("../jobs/payoutReconciliationJob");

let payoutWorkerInstance = null;

/**
 * Start and return the Payout worker instance.
 * Ensures singleton execution.
 *
 * @returns {Worker|null}
 */
function startPayoutWorker() {
  if (!isQueueConfigured()) {
    console.warn(
      `[Worker:${QUEUE_NAME}] Redis not configured. Payout worker cannot start.`,
    );
    return null;
  }

  if (payoutWorkerInstance) {
    return payoutWorkerInstance;
  }

  const connection = getQueueRedisConnection({ isWorker: true });
  if (!connection) {
    console.warn(
      `[Worker:${QUEUE_NAME}] Could not establish worker Redis connection.`,
    );
    return null;
  }

  try {
    payoutWorkerInstance = new Worker(
      QUEUE_NAME,
      async (job) => {
        return await handlePayoutReconciliation(job);
      },
      {
        connection,
        concurrency: 2,
      },
    );

    payoutWorkerInstance.on("completed", (job, result) => {
      console.log(`[Worker:${QUEUE_NAME}] Job ${job.id} completed. Result:`, {
        status: result?.payment?.status,
        outcome: result?.outcome,
      });
    });

    payoutWorkerInstance.on("failed", (job, err) => {
      console.error(
        `[Worker:${QUEUE_NAME}] Job ${job?.id} failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`,
      );
    });

    payoutWorkerInstance.on("error", (err) => {
      console.warn(`[Worker:${QUEUE_NAME}] Worker error:`, err.message);
    });

    console.log(
      `[Worker:${QUEUE_NAME}] Worker initialized and listening on queue '${QUEUE_NAME}'.`,
    );
    return payoutWorkerInstance;
  } catch (err) {
    console.error(
      `[Worker:${QUEUE_NAME}] Failed to initialize payout worker:`,
      err.message,
    );
    return null;
  }
}

/**
 * Gracefully close the Payout worker instance.
 */
async function closePayoutWorker() {
  if (payoutWorkerInstance) {
    try {
      await payoutWorkerInstance.close();
      console.log(`[Worker:${QUEUE_NAME}] Worker closed.`);
    } catch (err) {
      console.warn(`[Worker:${QUEUE_NAME}] Error closing worker:`, err.message);
    }
    payoutWorkerInstance = null;
  }
}

module.exports = {
  startPayoutWorker,
  closePayoutWorker,
};
