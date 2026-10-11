const { Worker } = require('bullmq');
const { isQueueConfigured, getQueueRedisConnection } = require('../config/queue');
const { QUEUE_NAME } = require('../queues/slaQueue');
const { handleSlaDeadlineCheck } = require('../jobs/slaJob');

let slaWorkerInstance = null;

/**
 * Start and return the SLA worker instance.
 * Ensures singleton execution.
 *
 * @returns {Worker|null}
 */
function startSlaWorker() {
  if (!isQueueConfigured()) {
    console.warn(`[Worker:${QUEUE_NAME}] Redis not configured. SLA worker cannot start.`);
    return null;
  }

  if (slaWorkerInstance) {
    return slaWorkerInstance;
  }

  const connection = getQueueRedisConnection({ isWorker: true });
  if (!connection) {
    console.warn(`[Worker:${QUEUE_NAME}] Could not establish worker Redis connection.`);
    return null;
  }

  try {
    slaWorkerInstance = new Worker(
      QUEUE_NAME,
      async (job) => {
        return await handleSlaDeadlineCheck(job);
      },
      {
        connection,
        concurrency: 3,
      }
    );

    slaWorkerInstance.on('completed', (job, result) => {
      console.log(`[Worker:${QUEUE_NAME}] Job ${job.id} completed. Result:`, result);
    });

    slaWorkerInstance.on('failed', (job, err) => {
      console.error(`[Worker:${QUEUE_NAME}] Job ${job?.id} failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`);
    });

    slaWorkerInstance.on('error', (err) => {
      console.warn(`[Worker:${QUEUE_NAME}] Worker error:`, err.message);
    });

    console.log(`[Worker:${QUEUE_NAME}] Worker initialized and listening on queue '${QUEUE_NAME}'.`);
    return slaWorkerInstance;
  } catch (err) {
    console.error(`[Worker:${QUEUE_NAME}] Failed to initialize SLA worker:`, err.message);
    return null;
  }
}

/**
 * Gracefully close the SLA worker instance.
 */
async function closeSlaWorker() {
  if (slaWorkerInstance) {
    try {
      await slaWorkerInstance.close();
      console.log(`[Worker:${QUEUE_NAME}] Worker closed.`);
    } catch (err) {
      console.warn(`[Worker:${QUEUE_NAME}] Error closing worker:`, err.message);
    }
    slaWorkerInstance = null;
  }
}

module.exports = {
  startSlaWorker,
  closeSlaWorker,
};
