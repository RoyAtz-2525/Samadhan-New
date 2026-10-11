/**
 * Centralized, configurable SLA (Service Level Agreement) policy for SAMADHAN.
 * Defines resolution target windows based on Issue Priority and Category.
 */

const SLA_CONFIG = {
  // Resolution targets by Priority level in hours
  PRIORITY_HOURS: {
    CRITICAL: 24,   // 24 hours (1 day)
    HIGH: 48,       // 48 hours (2 days)
    MEDIUM: 72,     // 72 hours (3 days)
    LOW: 120,       // 120 hours (5 days)
  },

  // Category overrides in hours (if specific civic departments have customized targets)
  CATEGORY_OVERRIDES: {
    // E.g. 'Public Safety': { CRITICAL: 12, HIGH: 24 }
  },

  // Warning milestone threshold percentage (e.g. 80% of window elapsed)
  NEAR_BREACH_THRESHOLD_PERCENT: 80,
};

/**
 * Get resolution target duration in hours for a given priority and optional category.
 *
 * @param {string} priority - 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
 * @param {string} [categoryName] - Name of category (optional)
 * @returns {number} Hours
 */
function getSlaHours(priority, categoryName) {
  const normPriority = (priority || 'MEDIUM').toUpperCase();
  if (categoryName && SLA_CONFIG.CATEGORY_OVERRIDES[categoryName]?.[normPriority]) {
    return SLA_CONFIG.CATEGORY_OVERRIDES[categoryName][normPriority];
  }
  return SLA_CONFIG.PRIORITY_HOURS[normPriority] || SLA_CONFIG.PRIORITY_HOURS.MEDIUM;
}

/**
 * Calculate expected deadline given a starting reference date and priority/category.
 *
 * @param {Date|string|number} startTime - Starting timestamp (e.g. approval or creation date)
 * @param {string} priority - Issue priority
 * @param {string} [categoryName] - Issue category
 * @returns {Date} Calculated deadline Date
 */
function calculateDeadline(startTime, priority, categoryName) {
  const start = new Date(startTime);
  const hours = getSlaHours(priority, categoryName);
  return new Date(start.getTime() + hours * 3600 * 1000);
}

/**
 * Check if an issue is overdue based on status and deadline.
 * Closed issues (RESOLVED, REJECTED, CANCELLED) are NEVER treated as active overdue issues.
 *
 * @param {string} status - Current IssueStatus
 * @param {Date|string} deadline - Deadline timestamp
 * @returns {boolean}
 */
function isIssueOverdue(status, deadline) {
  if (!deadline) return false;
  const terminalStatuses = ['RESOLVED', 'REJECTED', 'CANCELLED'];
  if (terminalStatuses.includes(status)) return false;
  return new Date() > new Date(deadline);
}

module.exports = {
  SLA_CONFIG,
  getSlaHours,
  calculateDeadline,
  isIssueOverdue,
};
