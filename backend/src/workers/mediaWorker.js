const { Worker } = require('bullmq');
const { isQueueConfigured, getQueueRedisConnection } = require('../config/queue');
const { QUEUE_NAME } = require('../queues/mediaQueue');
const { handleMediaCleanup } = require('../jobs/mediaCleanupJob');

let mediaWorkerInstance = null;

/**
 * Start and return the media worker instance.
 * Ensures singleton execution (avoids starting duplicate processors).
 *
 * @returns {Worker|null}
 */
function startMediaWorker() {
  if (!isQueueConfigured()) {
    console.warn(`[Worker:${QUEUE_NAME}] Redis not configured. Media worker cannot start.`);
    return null;
  }

  if (mediaWorkerInstance) {
    return mediaWorkerInstance;
  }

  const connection = getQueueRedisConnection({ isWorker: true });
  if (!connection) {
    console.warn(`[Worker:${QUEUE_NAME}] Could not establish worker Redis connection.`);
    return null;
  }

  try {
    mediaWorkerInstance = new Worker(
      QUEUE_NAME,
      async (job) => {
        return await handleMediaCleanup(job);
      },
      {
        connection,
        concurrency: 5,
      }
    );

    mediaWorkerInstance.on('completed', (job, result) => {
      console.log(`[Worker:${QUEUE_NAME}] Job ${job.id} completed. Result:`, result);
    });

    mediaWorkerInstance.on('failed', (job, err) => {
      console.error(`[Worker:${QUEUE_NAME}] Job ${job?.id} failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`);
    });

    mediaWorkerInstance.on('error', (err) => {
      console.warn(`[Worker:${QUEUE_NAME}] Worker error:`, err.message);
    });

    console.log(`[Worker:${QUEUE_NAME}] Worker initialized and listening on queue '${QUEUE_NAME}'.`);
    return mediaWorkerInstance;
  } catch (err) {
    console.error(`[Worker:${QUEUE_NAME}] Failed to initialize worker:`, err.message);
    return null;
  }
}

/**
 * Gracefully close the media worker instance.
 */
async function closeMediaWorker() {
  if (mediaWorkerInstance) {
    try {
      await mediaWorkerInstance.close();
      console.log(`[Worker:${QUEUE_NAME}] Worker closed.`);
    } catch (err) {
      console.warn(`[Worker:${QUEUE_NAME}] Error closing worker:`, err.message);
    }
    mediaWorkerInstance = null;
  }
}

module.exports = {
  startMediaWorker,
  closeMediaWorker,
};
