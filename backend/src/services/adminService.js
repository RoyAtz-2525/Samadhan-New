const { calculateDeadline } = require('../config/slaConfig');
const { scheduleSlaDeadlineCheck, cancelSlaDeadlineCheck } = require('../queues/slaQueue');
const { attachSlaToIssue, attachSlaToIssues } = require('./slaService');
const { prisma } = require('../config/db');

const getAdminDashboardMetrics = async () => {
  const metrics = await prisma.issue.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });

  const total = metrics.reduce((acc, curr) => acc + curr._count.id, 0);
  
  const statusCounts = metrics.reduce((acc, curr) => {
    acc[curr.status] = curr._count.id;
    return acc;
  }, {});

  return {
    totalIssues: total,
    pendingReview: (statusCounts['REPORTED'] || 0) + (statusCounts['UNDER_REVIEW'] || 0),
    approved: statusCounts['APPROVED'] || 0,
    rejected: statusCounts['REJECTED'] || 0,
    resolved: statusCounts['RESOLVED'] || 0,
    statusCounts
  };
};

const getIssues = async (filters = {}) => {
  const query = {
    include: {
      category: true,
      reporter: {
        include: {
          user: {
            select: { email: true, phone: true }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  };

  if (filters.status && filters.status !== 'ALL') {
    query.where = { status: filters.status };
  }

  return await prisma.issue.findMany(query);
};

const getIssueDetails = async (issueId) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      category: true,
      reporter: {
        include: {
          user: {
            select: { email: true, phone: true }
          }
        }
      },
      media: true,
      statusHistory: {
        orderBy: {
          timestamp: 'desc'
        },
        include: {
          changedBy: {
            select: {
              email: true,
              role: true
            }
          }
        }
      }
    }
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  return attachSlaToIssue(issue);
};

const reviewIssue = async (adminId, issueId, action, reason) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { category: true, statusHistory: true }
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate transitions
  const validTransitions = {
    'REPORTED': ['UNDER_REVIEW'],
    'UNDER_REVIEW': ['APPROVED', 'REJECTED']
  };

  let newStatus;
  if (action === 'UNDER_REVIEW') newStatus = 'UNDER_REVIEW';
  else if (action === 'APPROVE') newStatus = 'APPROVED';
  else if (action === 'REJECT') newStatus = 'REJECTED';
  else {
    const error = new Error('Invalid action');
    error.statusCode = 400;
    throw error;
  }

  if (!validTransitions[issue.status] || !validTransitions[issue.status].includes(newStatus)) {
    const error = new Error(`Cannot transition from ${issue.status} to ${newStatus}`);
    error.statusCode = 400;
    throw error;
  }

  if (newStatus === 'REJECTED' && !reason) {
    const error = new Error('Reason is required for rejection');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: { status: newStatus }
    });

    if (newStatus === 'APPROVED') {
      const deadline = calculateDeadline(new Date(), issue.priority, issue.category?.name);
      scheduleSlaDeadlineCheck(issueId, deadline).catch(() => {});
    } else if (newStatus === 'REJECTED') {
      cancelSlaDeadlineCheck(issueId).catch(() => {});
    }

    await tx.issueStatusHistory.create({
      data: {
        issueId,
        oldStatus: issue.status,
        newStatus,
        changedById: adminId,
        reason: reason || `Admin ${action} issue`
      }
    });

    return updatedIssue;
  });
};

const updateIssuePriority = async (adminId, issueId, priority) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { category: true, statusHistory: true }
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  // Only allow updating priority for active issues? The prompt doesn't restrict it,
  // but let's allow it in general.
  
  return await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: { priority }
    });

    // Reference start time is approval timestamp if approved, otherwise createdAt
    const approvedEntry = issue.statusHistory?.find(h => h.newStatus === 'APPROVED');
    const referenceTime = approvedEntry ? approvedEntry.timestamp : issue.createdAt;
    const newDeadline = calculateDeadline(referenceTime, priority, issue.category?.name);
    scheduleSlaDeadlineCheck(issueId, newDeadline).catch(() => {});

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ISSUE_PRIORITY_UPDATED',
        entityType: 'ISSUE',
        entityId: issueId,
        metadata: {
          oldPriority: issue.priority,
          newPriority: priority,
          newDeadline: newDeadline.toISOString(),
        }
      }
    }).catch(() => {});

    return attachSlaToIssue(updatedIssue);
  });
};

module.exports = {
  getAdminDashboardMetrics,
  getIssues,
  getIssueDetails,
  reviewIssue,
  updateIssuePriority
};
