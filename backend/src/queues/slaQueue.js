const { Queue } = require('bullmq');
const { isQueueConfigured, getQueueRedisConnection } = require('../config/queue');
const { JOB_NAMES } = require('../jobs');

const QUEUE_NAME = 'sla-deadline';

let slaQueueInstance = null;

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 500 },
};

/**
 * Get or initialize the SLA queue.
 * Returns null if Redis is not configured or offline.
 *
 * @returns {Queue|null}
 */
function getSlaQueue() {
  if (!isQueueConfigured()) {
    return null;
  }

  if (slaQueueInstance) {
    return slaQueueInstance;
  }

  const connection = getQueueRedisConnection({ isWorker: false });
  if (!connection) {
    return null;
  }

  try {
    slaQueueInstance = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    slaQueueInstance.on('error', (err) => {
      console.warn(`[Queue:${QUEUE_NAME}] Queue error:`, err.message);
    });

    return slaQueueInstance;
  } catch (err) {
    console.warn(`[Queue:${QUEUE_NAME}] Failed to create queue:`, err.message);
    return null;
  }
}

/**
 * Schedule or reschedule an SLA deadline milestone check for an issue.
 * Race-safe and handles BullMQ job states (delayed, active, completed).
 *
 * @param {string} issueId - Issue ID
 * @param {Date|string} deadline - The calculated deadline Date
 * @returns {Promise<void>}
 */
async function scheduleSlaDeadlineCheck(issueId, deadline) {
  if (!issueId || !deadline) return;

  const queue = getSlaQueue();
  if (!queue) {
    console.log(`[Queue:${QUEUE_NAME}] Redis offline; SLA check for #${issueId.slice(0, 8)} tracked via database reconciliation.`);
    return;
  }

  const targetTime = new Date(deadline).getTime();
  const now = Date.now();
  const delay = Math.max(0, targetTime - now);
  const stableJobId = `sla-check-${issueId}`;

  try {
    const existingJob = await queue.getJob(stableJobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'delayed') {
        // Change delay in place atomically
        await existingJob.changeDelay(delay);
        console.log(`[Queue:${QUEUE_NAME}] Updated delay for job ${stableJobId} to ${Math.round(delay / 60000)}m (target: ${new Date(deadline).toISOString()})`);
        return;
      } else if (state === 'active') {
        // Job is actively running. Do not disrupt it; add a follow-up job so the new deadline is not lost
        const followUpId = `${stableJobId}-${Date.now()}`;
        await queue.add(
          JOB_NAMES.SLA_CHECK_DEADLINE,
          { issueId, expectedDeadline: new Date(deadline).toISOString() },
          { jobId: followUpId, delay }
        );
        console.log(`[Queue:${QUEUE_NAME}] Added follow-up job ${followUpId} for active job (target: ${new Date(deadline).toISOString()})`);
        return;
      } else {
        // Completed or failed job: remove cleanly before re-adding
        await existingJob.remove().catch(() => {});
      }
    }

    await queue.add(
      JOB_NAMES.SLA_CHECK_DEADLINE,
      { issueId, expectedDeadline: new Date(deadline).toISOString() },
      {
        jobId: stableJobId,
        delay,
      }
    );
    console.log(`[Queue:${QUEUE_NAME}] Scheduled deadline check for issue #${issueId.slice(0, 8)} in ${Math.round(delay / 60000)}m (at ${new Date(deadline).toISOString()})`);
  } catch (err) {
    console.warn(`[Queue:${QUEUE_NAME}] Failed to schedule SLA check for #${issueId.slice(0, 8)}: ${err.message}`);
  }
}

/**
 * Cancel and remove any scheduled SLA deadline check for an issue.
 * Used when an issue is resolved, rejected, or cancelled.
 *
 * @param {string} issueId
 * @returns {Promise<void>}
 */
async function cancelSlaDeadlineCheck(issueId) {
  if (!issueId) return;
  const queue = getSlaQueue();
  if (!queue) return;

  try {
    const stableJobId = `sla-check-${issueId}`;
    const existingJob = await queue.getJob(stableJobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'delayed' || state === 'waiting') {
        await existingJob.remove();
        console.log(`[Queue:${QUEUE_NAME}] Cancelled SLA check for terminal issue #${issueId.slice(0, 8)}`);
      }
    }
  } catch (err) {
    console.warn(`[Queue:${QUEUE_NAME}] Could not cancel SLA check for #${issueId}: ${err.message}`);
  }
}

/**
 * Gracefully close the SLA queue instance.
 */
async function closeSlaQueue() {
  if (slaQueueInstance) {
    try {
      await slaQueueInstance.close();
    } catch (_) {}
    slaQueueInstance = null;
  }
}

module.exports = {
  QUEUE_NAME,
  getSlaQueue,
  scheduleSlaDeadlineCheck,
  cancelSlaDeadlineCheck,
  closeSlaQueue,
};
