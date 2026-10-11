const { prisma } = require('../config/db');
const { calculateDeadline, isIssueOverdue } = require('../config/slaConfig');
const { emitToRole, emitToUser } = require('../sockets/emitter');

/**
 * Handle background deadline check for an issue.
 * Concurrency-safe via PostgreSQL transaction advisory lock, database-verified, and idempotent.
 *
 * @param {import('bullmq').Job} job
 * @returns {Promise<Object>}
 */
async function handleSlaDeadlineCheck(job) {
  const { issueId } = job.data;
  if (!issueId) {
    return { status: 'skipped', reason: 'Missing issueId' };
  }

  // 1. Fetch fresh issue state directly from PostgreSQL (single source of truth)
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      category: true,
      statusHistory: { orderBy: { timestamp: 'asc' } },
      assignments: { where: { status: { notIn: ['CANCELLED', 'REJECTED'] } } },
    },
  });

  if (!issue) {
    return { status: 'skipped', reason: 'Issue no longer exists' };
  }

  // 2. Safety check: Resolved, rejected, or cancelled issues are NEVER overdue
  const terminalStatuses = ['RESOLVED', 'REJECTED', 'CANCELLED'];
  if (terminalStatuses.includes(issue.status)) {
    return { status: 'skipped', reason: `Issue is in closed status: ${issue.status}` };
  }

  // 3. Determine official reference start time (Approval time if approved, otherwise creation time)
  const approvedEntry = issue.statusHistory?.find(h => h.newStatus === 'APPROVED');
  const referenceTime = approvedEntry ? approvedEntry.timestamp : issue.createdAt;
  const currentDeadline = calculateDeadline(referenceTime, issue.priority, issue.category?.name);

  // 4. Stale-Job Protection & Rescheduling:
  // If not yet past current canonical deadline (e.g. priority was downgraded or deadline extended),
  // reschedule the job for the actual canonical deadline so the check is never dropped!
  if (new Date() < currentDeadline) {
    const { scheduleSlaDeadlineCheck } = require('../queues/slaQueue');
    await scheduleSlaDeadlineCheck(issue.id, currentDeadline);
    return {
      status: 'rescheduled_to_future_deadline',
      currentDeadline: currentDeadline.toISOString(),
      remainingMs: currentDeadline.getTime() - Date.now(),
    };
  }

  // 5. Concurrency-Safe Execution via PostgreSQL Advisory Lock
  // Prevents concurrent workers or retries from creating duplicate notifications
  const lockKey = `sla_overdue_${issue.id}`;
  
  const result = await prisma.$transaction(async (tx) => {

    // Acquire exclusive non-blocking transaction advisory lock for this issue
    const lockResult = await tx.$queryRaw`
      SELECT pg_try_advisory_xact_lock(hashtext(${lockKey})) as acquired;
    `;

    if (!lockResult[0]?.acquired) {
      // Another worker/thread is currently processing this issue's SLA check
      return { status: 'concurrency_locked', reason: 'Another worker is processing this issue' };
    }

    // Under exclusive lock, re-verify if breach was already recorded or notified
    const existingBreach = await tx.auditLog.findFirst({
      where: {
        action: 'SLA_BREACH_DETECTED',
        entityType: 'ISSUE',
        entityId: issue.id,
      },
    });

    if (existingBreach) {
      return { status: 'already_notified', breachId: existingBreach.id };
    }

    const existingNotification = await tx.notification.findFirst({
      where: {
        issueId: issue.id,
        type: 'ALERT',
        title: { contains: 'Overdue' },
      },
    });

    if (existingNotification) {
      return { status: 'already_notified', notificationId: existingNotification.id };
    }

    // Identify recipient user IDs: Assigned Worker & Assigned Manager
    const targetUserIds = [];
    if (issue.assignments && issue.assignments.length > 0) {
      for (const assignment of issue.assignments) {
        const worker = await tx.workerProfile.findUnique({ where: { id: assignment.workerId } });
        if (worker?.userId && !targetUserIds.includes(worker.userId)) targetUserIds.push(worker.userId);
        const manager = await tx.managerProfile.findUnique({ where: { id: assignment.managerId } });
        if (manager?.userId && !targetUserIds.includes(manager.userId)) targetUserIds.push(manager.userId);
      }
    }

    // If no assigned worker/manager yet, notify admins
    if (targetUserIds.length === 0) {
      const admins = await tx.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
        take: 3,
      });
      admins.forEach(a => targetUserIds.push(a.id));
    }

    const notificationTitle = `SLA Overdue: Issue #${issue.id.slice(0, 8)}`;
    const notificationMessage = `Issue "${issue.title}" (${issue.priority} priority) has exceeded its SLA resolution deadline.`;

    // Persist notifications atomically inside transaction
    for (const userId of targetUserIds) {
      await tx.notification.create({
        data: {
          userId,
          type: 'ALERT',
          title: notificationTitle,
          message: notificationMessage,
          issueId: issue.id,
        },
      });
    }

    // Record automated audit log
    await tx.auditLog.create({
      data: {
        action: 'SLA_BREACH_DETECTED',
        entityType: 'ISSUE',
        entityId: issue.id,
        metadata: {
          priority: issue.priority,
          deadline: currentDeadline.toISOString(),
          detectedAt: new Date().toISOString(),
        },
      },
    });

    return { status: 'overdue_processed', notifiedUsers: targetUserIds.length };
  }, { maxWait: 10000, timeout: 20000 });

  // 6. Broadcast real-time Socket.IO events (only after transaction commits!)
  if (result.status === 'overdue_processed') {
    try {
      emitToRole('ADMIN', 'issue:overdue', { issueId: issue.id, deadline: currentDeadline.toISOString(), title: issue.title });
      emitToRole('MANAGER', 'issue:overdue', { issueId: issue.id, deadline: currentDeadline.toISOString(), title: issue.title });
    } catch (emitErr) {
      console.warn('[SLA Worker] Socket emit warning:', emitErr.message);
    }
  }

  return result;
}

module.exports = {
  handleSlaDeadlineCheck,
};
