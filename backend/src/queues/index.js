const {
  QUEUE_NAME: MEDIA_QUEUE_NAME,
  getMediaQueue,
  enqueueMediaCleanup,
  closeMediaQueue,
} = require('./mediaQueue');
const {
  QUEUE_NAME: SLA_QUEUE_NAME,
  getSlaQueue,
  scheduleSlaDeadlineCheck,
  cancelSlaDeadlineCheck,
  closeSlaQueue,
} = require('./slaQueue');
const {
  QUEUE_NAME: PAYOUT_RECONCILIATION_QUEUE_NAME,
  getPayoutReconciliationQueue,
  schedulePayoutReconciliation,
  closePayoutReconciliationQueue,
} = require('./payoutReconciliationQueue');
const { closeQueueConnections } = require('../config/queue');

/**
 * Gracefully close all queues and underlying connections.
 */
async function closeAllQueues() {
  await closeMediaQueue();
  await closeSlaQueue();
  await closePayoutReconciliationQueue();
  await closeQueueConnections();
}

module.exports = {
  MEDIA_QUEUE_NAME,
  getMediaQueue,
  enqueueMediaCleanup,
  closeMediaQueue,
  SLA_QUEUE_NAME,
  getSlaQueue,
  scheduleSlaDeadlineCheck,
  cancelSlaDeadlineCheck,
  closeSlaQueue,
  PAYOUT_RECONCILIATION_QUEUE_NAME,
  getPayoutReconciliationQueue,
  schedulePayoutReconciliation,
  closePayoutReconciliationQueue,
  closeAllQueues,
};
