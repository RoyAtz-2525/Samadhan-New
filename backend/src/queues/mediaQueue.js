const { Queue } = require('bullmq');
const { isQueueConfigured, getQueueRedisConnection } = require('../config/queue');
const { JOB_NAMES } = require('../jobs');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');

const QUEUE_NAME = 'media-cleanup';

let mediaQueueInstance = null;

/**
 * Default job options ensuring:
 * - 3 retry attempts
 * - Exponential backoff (starting at 2s)
 * - Retention limits: 100 completed, 500 failed
 */
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

/**
 * Get or initialize the media cleanup queue.
 * Returns null if Redis is not configured or offline.
 *
 * @returns {Queue|null}
 */
function getMediaQueue() {
  if (!isQueueConfigured()) {
    return null;
  }

  if (mediaQueueInstance) {
    return mediaQueueInstance;
  }

  const connection = getQueueRedisConnection({ isWorker: false });
  if (!connection) {
    return null;
  }

  try {
    mediaQueueInstance = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    mediaQueueInstance.on('error', (err) => {
      console.warn(`[Queue:${QUEUE_NAME}] Queue error:`, err.message);
    });

    return mediaQueueInstance;
  } catch (err) {
    console.warn(`[Queue:${QUEUE_NAME}] Failed to create queue:`, err.message);
    return null;
  }
}

/**
 * Enqueue orphan Cloudinary assets for background deletion.
 *
 * Resilience Strategy:
 * - If Queue/Redis is available: enqueues job with deduplicated jobId (`cleanup-${publicId}`).
 * - If Queue/Redis is NOT available: gracefully executes inline fallback deletion so assets are not leaked.
 * - Never throws unhandled errors to caller.
 *
 * @param {Array<Object>|Object} assets - Asset or list of assets ({ publicId, resourceType })
 * @returns {Promise<void>}
 */
async function enqueueMediaCleanup(assets) {
  if (!assets) return;
  const list = Array.isArray(assets) ? assets : [assets];
  if (list.length === 0) return;

  const queue = getMediaQueue();

  for (const asset of list) {
    if (!asset || !asset.publicId) continue;

    const resourceType = asset.resourceType || (asset.type === 'VIDEO' ? 'video' : 'image');

    if (queue) {
      try {
        const stableJobId = `cleanup-${asset.publicId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        await queue.add(
          JOB_NAMES.MEDIA_CLEANUP,
          { publicId: asset.publicId, resourceType },
          { jobId: stableJobId }
        );
        console.log(`[Queue:${QUEUE_NAME}] Enqueued background cleanup for asset: ${asset.publicId}`);
        continue;
      } catch (err) {
        console.warn(`[Queue:${QUEUE_NAME}] Failed to enqueue '${asset.publicId}', running inline fallback: ${err.message}`);
      }
    }

    // Direct synchronous fallback when Redis is absent or enqueue fails
    try {
      await deleteFromCloudinary(asset.publicId, resourceType);
    } catch (fallbackErr) {
      console.warn(`[Cleanup:Fallback] Failed inline deletion for '${asset.publicId}': ${fallbackErr.message}`);
    }
  }
}

/**
 * Gracefully close the media queue instance.
 */
async function closeMediaQueue() {
  if (mediaQueueInstance) {
    try {
      await mediaQueueInstance.close();
    } catch (_) {}
    mediaQueueInstance = null;
  }
}

module.exports = {
  QUEUE_NAME,
  getMediaQueue,
  enqueueMediaCleanup,
  closeMediaQueue,
};
