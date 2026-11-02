const { prisma } = require('../config/db');
const crypto = require('crypto');
const { REWARD_POINTS, REWARD_CATALOG, getCatalogItem } = require('../config/rewardConfig');
const { emitToUser } = require('../sockets/emitter');

/**
 * Award points for an approved genuine civic report.
 * Transactional and idempotent via DB constraint @@unique([citizenId, issueId, eventType])
 */
const awardReportApprovedReward = async (txOrPrisma, issueOrId) => {
  const client = txOrPrisma || prisma;

  let issue = issueOrId;
  if (typeof issueOrId === 'string') {
    issue = await client.issue.findUnique({
      where: { id: issueOrId },
      include: {
        reporter: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
    });
  } else if (!issue.reporter || !issue.reporter.user) {
    issue = await client.issue.findUnique({
      where: { id: issue.id },
      include: {
        reporter: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
    });
  }

  if (!issue || !issue.reporter) {
    return null;
  }

  const citizen = issue.reporter;
  const points = REWARD_POINTS.REPORT_APPROVED;

  // 1. Idempotency check: see if reward was already awarded
  const existingReward = await client.rewardLedger.findUnique({
    where: {
      citizenId_issueId_eventType: {
        citizenId: citizen.id,
        issueId: issue.id,
        eventType: 'REPORT_APPROVED',
      },
    },
  });

  if (existingReward) {
    return existingReward;
  }

  // 2. Insert ledger record
  const ledgerEntry = await client.rewardLedger.create({
    data: {
      citizenId: citizen.id,
      issueId: issue.id,
      points,
      eventType: 'REPORT_APPROVED',
      status: 'EARNED',
      reason: `Civic report approved by authority: "${issue.title || 'Reported Issue'}"`,
      metadata: {
        issueId: issue.id,
        issueTitle: issue.title,
        awardedAt: new Date().toISOString(),
      },
    },
  });

  // 3. Increment citizen balances atomically
  const updatedCitizen = await client.citizenProfile.update({
    where: { id: citizen.id },
    data: {
      rewardPoints: { increment: points },
      lifetimePoints: { increment: points },
    },
  });

  // 4. Create in-app notification
  try {
    await client.notification.create({
      data: {
        userId: citizen.userId,
        type: 'REWARD',
        title: 'Citizen Points Earned! (+10 pts)',
        message: `Your civic report "${issue.title}" was verified and approved by authorities. You earned ${points} reward points!`,
        issueId: issue.id,
      },
    });
  } catch (err) {
    console.error('Failed to create reward notification:', err.message);
  }

  // 5. Emit real-time Socket.IO event
  try {
    emitToUser(citizen.userId, 'REWARD_EARNED', {
      points,
      eventType: 'REPORT_APPROVED',
      currentBalance: updatedCitizen.rewardPoints,
      lifetimeBalance: updatedCitizen.lifetimePoints,
      issueId: issue.id,
      issueTitle: issue.title,
    });
  } catch (err) {
    console.error('Failed to emit reward socket event:', err.message);
  }

  return ledgerEntry;
};

/**
 * Award bonus points when an issue is successfully resolved.
 * Transactional and idempotent.
 */
const awardIssueResolvedReward = async (txOrPrisma, issueId) => {
  const client = txOrPrisma || prisma;

  const issue = await client.issue.findUnique({
    where: { id: issueId },
    include: {
      reporter: {
        include: { user: { select: { id: true, email: true } } },
      },
    },
  });

  if (!issue || !issue.reporter) {
    return null;
  }

  const citizen = issue.reporter;
  const points = REWARD_POINTS.ISSUE_RESOLVED;

  // 1. Idempotency check: see if resolved bonus already awarded
  const existingReward = await client.rewardLedger.findUnique({
    where: {
      citizenId_issueId_eventType: {
        citizenId: citizen.id,
        issueId: issue.id,
        eventType: 'ISSUE_RESOLVED',
      },
    },
  });

  if (existingReward) {
    return existingReward;
  }

  // 2. Insert ledger record
  const ledgerEntry = await client.rewardLedger.create({
    data: {
      citizenId: citizen.id,
      issueId: issue.id,
      points,
      eventType: 'ISSUE_RESOLVED',
      status: 'EARNED',
      reason: `Civic issue successfully resolved: "${issue.title || 'Reported Issue'}"`,
      metadata: {
        issueId: issue.id,
        issueTitle: issue.title,
        awardedAt: new Date().toISOString(),
      },
    },
  });

  // 3. Increment citizen balances atomically
  const updatedCitizen = await client.citizenProfile.update({
    where: { id: citizen.id },
    data: {
      rewardPoints: { increment: points },
      lifetimePoints: { increment: points },
    },
  });

  // 4. Create in-app notification
  try {
    await client.notification.create({
      data: {
        userId: citizen.userId,
        type: 'REWARD',
        title: 'Issue Resolved Bonus! (+10 pts)',
        message: `Issue "${issue.title}" has been successfully resolved on the ground! You earned ${points} bonus points.`,
        issueId: issue.id,
      },
    });
  } catch (err) {
    console.error('Failed to create reward notification:', err.message);
  }

  // 5. Emit real-time Socket.IO event
  try {
    emitToUser(citizen.userId, 'REWARD_EARNED', {
      points,
      eventType: 'ISSUE_RESOLVED',
      currentBalance: updatedCitizen.rewardPoints,
      lifetimeBalance: updatedCitizen.lifetimePoints,
      issueId: issue.id,
      issueTitle: issue.title,
    });
  } catch (err) {
    console.error('Failed to emit reward socket event:', err.message);
  }

  return ledgerEntry;
};

/**
 * Get comprehensive citizen reward overview (balance, lifetime, history, rules).
 */
const getCitizenRewardSummary = async (userId) => {
  const citizen = await prisma.citizenProfile.findUnique({
    where: { userId },
  });

  if (!citizen) {
    const error = new Error('Citizen profile not found');
    error.statusCode = 404;
    throw error;
  }

  const [ledgerEntries, counts] = await Promise.all([
    prisma.rewardLedger.findMany({
      where: { citizenId: citizen.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        issue: {
          select: { id: true, title: true, status: true, createdAt: true },
        },
      },
    }),
    prisma.rewardLedger.groupBy({
      by: ['status'],
      where: { citizenId: citizen.id },
      _sum: { points: true },
      _count: { id: true },
    }),
  ]);

  let totalEarned = 0;
  let totalRedeemed = 0;

  counts.forEach((group) => {
    if (group.status === 'EARNED') {
      totalEarned = group._sum.points || 0;
    } else if (group.status === 'REDEEMED') {
      totalRedeemed = Math.abs(group._sum.points || 0);
    }
  });

  return {
    rewardPoints: citizen.rewardPoints || 0,
    lifetimePoints: citizen.lifetimePoints || 0,
    totalEarned,
    totalRedeemed,
    recentHistory: ledgerEntries,
    catalog: REWARD_CATALOG,
    rules: {
      reportApproved: REWARD_POINTS.REPORT_APPROVED,
      issueResolved: REWARD_POINTS.ISSUE_RESOLVED,
      policy: 'Genuine reports approved by Admin award 10 pts. Successful ground resolution awards 10 bonus pts. Rejected reports earn 0 pts. Points can be redeemed for civic passes & certificates.',
    },
  };
};

/**
 * Get paginated reward history with filters.
 */
const getCitizenRewardHistory = async (userId, options = {}) => {
  const { page = 1, limit = 10, eventType } = options;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const citizen = await prisma.citizenProfile.findUnique({
    where: { userId },
  });

  if (!citizen) {
    const error = new Error('Citizen profile not found');
    error.statusCode = 404;
    throw error;
  }

  const where = { citizenId: citizen.id };
  if (eventType) {
    where.eventType = eventType;
  }

  const [total, entries] = await Promise.all([
    prisma.rewardLedger.count({ where }),
    prisma.rewardLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        issue: {
          select: { id: true, title: true, status: true, createdAt: true },
        },
      },
    }),
  ]);

  return {
    entries,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Phase 4 Redemption: Redeem reward points for a curated non-monetary civic benefit.
 * Strictly non-cash: prevents monetary drain and enforces point balance check in transaction.
 */
const redeemReward = async (userId, catalogItemId) => {
  const item = getCatalogItem(catalogItemId);
  if (!item) {
    const error = new Error('Invalid or expired reward voucher selected');
    error.statusCode = 400;
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Lock and check citizen balance
    const citizen = await tx.citizenProfile.findUnique({
      where: { userId },
    });

    if (!citizen) {
      const error = new Error('Citizen profile not found');
      error.statusCode = 404;
      throw error;
    }

    if (citizen.rewardPoints < item.pointsCost) {
      const error = new Error(
        `Insufficient points balance. You have ${citizen.rewardPoints} points, but "${item.title}" requires ${item.pointsCost} points.`
      );
      error.statusCode = 400;
      throw error;
    }

    // 2. Generate secure unique voucher code
    const voucherCode = `SMD-${item.id.slice(0, 4).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 3. Decrement citizen rewardPoints (lifetime points remain intact)
    const updatedCitizen = await tx.citizenProfile.update({
      where: { id: citizen.id },
      data: {
        rewardPoints: { decrement: item.pointsCost },
      },
    });

    // 4. Create ledger record with negative points
    const ledgerEntry = await tx.rewardLedger.create({
      data: {
        citizenId: citizen.id,
        issueId: null,
        points: -item.pointsCost,
        eventType: 'REDEMPTION',
        status: 'REDEEMED',
        reason: `Redeemed voucher: "${item.title}"`,
        metadata: {
          catalogItemId: item.id,
          voucherTitle: item.title,
          voucherCode,
          pointsCost: item.pointsCost,
          redeemedAt: new Date().toISOString(),
          terms: item.terms,
        },
      },
    });

    // 5. In-app notification
    await tx.notification.create({
      data: {
        userId,
        type: 'REWARD',
        title: 'Voucher Redeemed Successfully!',
        message: `You redeemed "${item.title}" (Code: ${voucherCode}). Remaining balance: ${updatedCitizen.rewardPoints} points.`,
      },
    });

    return {
      ledgerEntry,
      updatedCitizen,
      voucher: {
        code: voucherCode,
        title: item.title,
        category: item.category,
        description: item.description,
        terms: item.terms,
        redeemedAt: new Date().toISOString(),
      },
    };
  });

  // Emit real-time update
  try {
    emitToUser(userId, 'REWARD_REDEEMED', {
      voucherCode: result.voucher.code,
      title: result.voucher.title,
      newBalance: result.updatedCitizen.rewardPoints,
    });
  } catch (err) {
    console.error('Failed to emit redemption socket event:', err.message);
  }

  return {
    success: true,
    message: `Successfully redeemed ${result.voucher.title}`,
    voucher: result.voucher,
    currentBalance: result.updatedCitizen.rewardPoints,
  };
};

/**
 * Admin Audit view for reward distributions.
 */
const getAdminRewardAudit = async (query = {}) => {
  const { page = 1, limit = 20, eventType, search } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const where = {};
  if (eventType) {
    where.eventType = eventType;
  }
  if (search) {
    where.OR = [
      { reason: { contains: search, mode: 'insensitive' } },
      { citizen: { user: { email: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const [total, entries, aggregates] = await Promise.all([
    prisma.rewardLedger.count({ where }),
    prisma.rewardLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        citizen: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
          },
        },
        issue: {
          select: { id: true, title: true, status: true },
        },
      },
    }),
    prisma.rewardLedger.aggregate({
      _sum: { points: true },
      _count: { id: true },
    }),
  ]);

  return {
    entries,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
    stats: {
      totalTransactions: aggregates._count.id || 0,
      netPointsDistributed: aggregates._sum.points || 0,
      activeCatalogItems: REWARD_CATALOG.length,
    },
  };
};

module.exports = {
  awardReportApprovedReward,
  awardIssueResolvedReward,
  getCitizenRewardSummary,
  getCitizenRewardHistory,
  redeemReward,
  getAdminRewardAudit,
  REWARD_CATALOG,
};
