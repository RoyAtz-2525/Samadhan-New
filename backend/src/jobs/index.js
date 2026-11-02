const { handleMediaCleanup } = require('./mediaCleanupJob');
const { handleSlaDeadlineCheck } = require('./slaJob');
const { handlePayoutReconciliation } = require('./payoutReconciliationJob');

const JOB_NAMES = {
  MEDIA_CLEANUP: 'media:cleanup',
  SLA_CHECK_DEADLINE: 'sla:check-deadline',
  PAYOUT_RECONCILE: 'payout:reconcile',
};

module.exports = {
  JOB_NAMES,
  handleMediaCleanup,
  handleSlaDeadlineCheck,
  handlePayoutReconciliation,
};
