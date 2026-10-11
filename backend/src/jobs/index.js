const { handleMediaCleanup } = require('./mediaCleanupJob');
const { handleSlaDeadlineCheck } = require('./slaJob');

const JOB_NAMES = {
  MEDIA_CLEANUP: 'media:cleanup',
  SLA_CHECK_DEADLINE: 'sla:check-deadline',
};

module.exports = {
  JOB_NAMES,
  handleMediaCleanup,
  handleSlaDeadlineCheck,
};
