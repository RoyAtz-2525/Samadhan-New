const { prisma } = require('../config/db');
const { calculateDeadline, isIssueOverdue, getSlaHours } = require('../config/slaConfig');

/**
 * Derive deadline for an issue from its lifecycle timestamps.
 * Priority:
 * 1. An active WorkAssignment's expectedCompletionDate.
 * 2. Calculated from the official APPROVED timestamp in statusHistory.
 * 3. Fallback to createdAt timestamp.
 *
 * @param {Object} issue
 * @returns {Date}
 */
function deriveIssueDeadline(issue) {
  if (!issue) return null;

  // Check assignment
  if (issue.assignments && issue.assignments.length > 0) {
    const activeAssignment = issue.assignments.find(a => !['CANCELLED', 'REJECTED'].includes(a.status));
    if (activeAssignment?.expectedCompletionDate) {
      return new Date(activeAssignment.expectedCompletionDate);
    }
  }

  // Check approval timestamp in statusHistory
  const approvedHistory = issue.statusHistory?.find(h => h.newStatus === 'APPROVED');
  const referenceTime = approvedHistory ? approvedHistory.timestamp : issue.createdAt;

  return calculateDeadline(referenceTime, issue.priority, issue.category?.name);
}

/**
 * Enrich an issue object with standardized SLA metrics.
 *
 * @param {Object} issue
 * @returns {Object}
 */
function attachSlaToIssue(issue) {
  if (!issue) return null;

  const deadline = deriveIssueDeadline(issue);
  const overdue = isIssueOverdue(issue.status, deadline);
  const now = Date.now();
  const timeRemainingMs = deadline ? new Date(deadline).getTime() - now : null;
  const slaTargetHours = getSlaHours(issue.priority, issue.category?.name);

  let slaStatus = 'ON_TRACK';
  if (['RESOLVED'].includes(issue.status)) {
    const resolvedEntry = issue.statusHistory?.find(h => h.newStatus === 'RESOLVED');
    const resolvedAt = resolvedEntry ? new Date(resolvedEntry.timestamp).getTime() : now;
    slaStatus = deadline && resolvedAt > new Date(deadline).getTime() ? 'RESOLVED_OVERDUE' : 'RESOLVED_ON_TIME';
  } else if (['REJECTED', 'CANCELLED'].includes(issue.status)) {
    slaStatus = 'CLOSED';
  } else if (overdue) {
    slaStatus = 'OVERDUE';
  } else if (timeRemainingMs && timeRemainingMs < 24 * 3600 * 1000) {
    slaStatus = 'NEAR_BREACH';
  }

  return {
    ...issue,
    deadline: deadline ? deadline.toISOString() : null,
    isOverdue: overdue,
    timeRemainingMs,
    slaTargetHours,
    slaStatus,
    expectedResolutionDate: deadline ? deadline.toISOString() : null,
    isDelayed: overdue,
  };
}

/**
 * Enrich a list of issues with SLA metrics.
 *
 * @param {Array<Object>} issues
 * @returns {Array<Object>}
 */
function attachSlaToIssues(issues) {
  if (!Array.isArray(issues)) return [];
  return issues.map(attachSlaToIssue);
}

/**
 * Enrich a work assignment with SLA metrics.
 *
 * @param {Object} assignment
 * @returns {Object}
 */
function attachSlaToAssignment(assignment) {
  if (!assignment) return null;

  const deadline = assignment.expectedCompletionDate
    ? new Date(assignment.expectedCompletionDate)
    : (assignment.issue ? deriveIssueDeadline(assignment.issue) : null);

  const overdue = isIssueOverdue(assignment.status === 'COMPLETED' ? 'RESOLVED' : assignment.status, deadline);
  const now = Date.now();
  const timeRemainingMs = deadline ? deadline.getTime() - now : null;

  return {
    ...assignment,
    deadline: deadline ? deadline.toISOString() : null,
    isOverdue: overdue,
    timeRemainingMs,
  };
}

/**
 * Reconcile overdue status against PostgreSQL database as the single source of truth.
 * Safe recovery for missed deadlines when Redis/Worker was unavailable.
 * Concurrency-safe via PostgreSQL transaction advisory lock.
 *
 * @returns {Promise<Object>} Summary of reconciliation
 */
async function reconcileOverdueIssues() {
  const activeStatuses = ['APPROVED', 'ASSIGNED', 'WORK_STARTED', 'WORK_COMPLETED', 'UNDER_VERIFICATION'];

  const candidateIssues = await prisma.issue.findMany({
    where: {
      status: { in: activeStatuses },
    },
    include: {
      category: true,
      statusHistory: { orderBy: { timestamp: 'asc' } },
      assignments: { where: { status: { notIn: ['CANCELLED', 'REJECTED'] } } },
    },
  });

  let overdueCount = 0;
  let newlyNotifiedCount = 0;

  for (const issue of candidateIssues) {
    const deadline = deriveIssueDeadline(issue);
    if (deadline && new Date() > deadline) {
      overdueCount++;

      // Atomically check and notify under transactional advisory lock
      const lockKey = `sla_overdue_${issue.id}`;
      await prisma.$transaction(async (tx) => {
        const lockRes = await tx.$queryRaw`
          SELECT pg_try_advisory_xact_lock(hashtext(${lockKey})) as acquired;
        `;
        if (!lockRes[0]?.acquired) return; // Concurrently being processed

        // 1. Check if breach was already recorded in AuditLog or Notifications
        const existingBreach = await tx.auditLog.findFirst({
          where: {
            action: 'SLA_BREACH_DETECTED',
            entityType: 'ISSUE',
            entityId: issue.id,
          },
        });
        if (existingBreach) return; // Already recorded breach

        const existingAlert = await tx.notification.findFirst({
          where: {
            issueId: issue.id,
            type: 'ALERT',
            title: { contains: 'Overdue' },
          },
        });
        if (existingAlert) return; // Already notified

        newlyNotifiedCount++;

        // 2. Identify and notify assigned manager, worker, or fallback to admins
        let notifiedAny = false;
        if (issue.assignments && issue.assignments.length > 0) {
          for (const a of issue.assignments) {
            const manager = await tx.managerProfile.findUnique({ where: { id: a.managerId } });
            if (manager?.userId) {
              await tx.notification.create({
                data: {
                  userId: manager.userId,
                  type: 'ALERT',
                  title: `SLA Overdue: Issue #${issue.id.slice(0, 8)}`,
                  message: `Issue "${issue.title}" (${issue.priority}) has breached its resolution SLA.`,
                  issueId: issue.id,
                },
              });
              notifiedAny = true;
            }
          }
        }

        // If unassigned or manager has no user, notify active Admins
        if (!notifiedAny) {
          const admins = await tx.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            select: { id: true },
            take: 3,
          });
          for (const admin of admins) {
            await tx.notification.create({
              data: {
                userId: admin.id,
                type: 'ALERT',
                title: `SLA Overdue: Issue #${issue.id.slice(0, 8)}`,
                message: `Issue "${issue.title}" (${issue.priority}) has breached its resolution SLA.`,
                issueId: issue.id,
              },
            });
          }
        }

        // 3. Record breach in AuditLog atomically
        await tx.auditLog.create({
          data: {
            action: 'SLA_BREACH_DETECTED',
            entityType: 'ISSUE',
            entityId: issue.id,
            metadata: {
              priority: issue.priority,
              deadline: deadline.toISOString(),
              source: 'DATABASE_RECONCILIATION',
            },
          },
        });
      }, { maxWait: 10000, timeout: 20000 }).catch(err => {
        console.warn(`[SLA Reconciliation] Error for issue #${issue.id.slice(0, 8)}:`, err.message);
      });
    }
  }

  return {
    scannedCount: candidateIssues.length,
    overdueCount,
    newlyNotifiedCount,
  };
}

module.exports = {
  deriveIssueDeadline,
  attachSlaToIssue,
  attachSlaToIssues,
  attachSlaToAssignment,
  reconcileOverdueIssues,
};
