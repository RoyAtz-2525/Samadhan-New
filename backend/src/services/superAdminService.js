const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SuperAdminService {
  async getPlatformOverview() {
    // 1. Role distribution
    const usersByRole = await prisma.user.groupBy({
      by: ['roleId'],
      _count: {
        id: true,
      },
    });

    const roles = await prisma.role.findMany();
    const roleDistribution = roles.reduce((acc, role) => {
      const countItem = usersByRole.find(item => item.roleId === role.id);
      acc[role.name] = countItem ? countItem._count.id : 0;
      return acc;
    }, {});
    
    // Calculate total users
    const totalUsers = Object.values(roleDistribution).reduce((a, b) => a + b, 0);

    // 2. Issue Distribution
    const issuesByStatus = await prisma.issue.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const issueDistribution = issuesByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {});

    const totalIssues = Object.values(issueDistribution).reduce((a, b) => a + b, 0);

    // 3. Verifications
    const pendingBeforeVerifications = await prisma.beforeWorkVerification.count({
      where: { status: 'PENDING' }
    });
    const pendingAfterVerifications = await prisma.afterWorkVerification.count({
      where: { status: 'PENDING' }
    });
    const pendingVerifications = pendingBeforeVerifications + pendingAfterVerifications;

    // 4. Assignments
    const pendingAssignments = await prisma.workAssignment.count({
      where: { status: 'PENDING' }
    });

    // 5. Payments
    const completedPayments = await prisma.payment.count({
      where: { status: 'COMPLETED' }
    });
    const totalPaymentAmount = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    });

    // 6. Recent Activity (last 10 audit logs if exist, otherwise we can simulate from recent records)
    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        actor: {
          select: { id: true, email: true, phone: true, role: true }
        }
      }
    });

    return {
      kpis: {
        totalUsers,
        citizens: roleDistribution['CITIZEN'] || 0,
        admins: roleDistribution['ADMIN'] || 0,
        managers: roleDistribution['MANAGER'] || 0,
        workers: roleDistribution['WORKER'] || 0,
        totalIssues,
        openIssues: issueDistribution['REPORTED'] || 0,
        inProgressIssues: (issueDistribution['WORK_STARTED'] || 0) + (issueDistribution['UNDER_VERIFICATION'] || 0),
        resolvedIssues: issueDistribution['RESOLVED'] || 0,
        pendingVerifications,
        pendingAssignments,
        completedPayments,
        totalPaymentValue: totalPaymentAmount._sum.amount || 0
      },
      issueDistribution,
      roleDistribution,
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        timestamp: log.timestamp,
        actorRole: log.actor?.role?.name || 'SYSTEM'
      }))
    };
  }

  async getAllUsers(filters) {
    const where = {};
    if (filters.role) {
      where.role = { name: filters.role };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        citizenProfile: true,
        adminProfile: true,
        managerProfile: true,
        workerProfile: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit for now
    });
    
    return users.map(user => {
      const { passwordHash, refreshToken, ...safeUser } = user;
      return safeUser;
    });
  }

  async getAllIssues(filters) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.categoryId) where.categoryId = filters.categoryId;

    return prisma.issue.findMany({
      where,
      include: {
        category: true,
        reporter: {
          include: { user: { select: { id: true, email: true, phone: true, roleId: true } } }
        },
        assignments: {
          include: { worker: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async getIssueDetail(issueId) {
    return prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        category: true,
        media: true,
        reporter: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } },
        statusHistory: { 
          include: { changedBy: { include: { role: true } } },
          orderBy: { timestamp: 'desc' } 
        },
        assignments: {
          include: {
            worker: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } },
            manager: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } },
            beforeVerification: { include: { media: true } },
            afterVerification: { include: { media: true } },
            progressRecords: { include: { media: true }, orderBy: { createdAt: 'desc' } }
          }
        },
        payments: true
      }
    });
  }

  async getAllAssignments(filters) {
    const where = {};
    if (filters.status) where.status = filters.status;
    
    return prisma.workAssignment.findMany({
      where,
      include: {
        issue: { select: { title: true, status: true, priority: true } },
        worker: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } },
        manager: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } }
      },
      orderBy: { assignedDate: 'desc' },
      take: 50
    });
  }

  async getAllVerifications(type = 'all') {
    let before = [];
    let after = [];
    
    if (type === 'all' || type === 'before') {
      before = await prisma.beforeWorkVerification.findMany({
        include: {
          assignment: { include: { issue: { select: { title: true } } } },
          worker: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } }
        },
        orderBy: { timestamp: 'desc' },
        take: 30
      });
    }

    if (type === 'all' || type === 'after') {
      after = await prisma.afterWorkVerification.findMany({
        include: {
          assignment: { include: { issue: { select: { title: true } } } },
          worker: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } }
        },
        orderBy: { timestamp: 'desc' },
        take: 30
      });
    }

    return { before, after };
  }

  async getAllPayments(filters) {
    const where = {};
    if (filters.status) where.status = filters.status;

    return prisma.payment.findMany({
      where,
      include: {
        worker: { include: { user: { select: { id: true, email: true, phone: true, roleId: true } } } },
        issue: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async getAuditLogs(filters) {
    const where = {};
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;

    return prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, email: true, phone: true, role: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
  }

  async getNotifications(filters) {
    const where = {};
    
    if (filters.type) where.type = filters.type;
    
    // Note: Filtering by read/unread for Super Admin views the original recipient's read state.
    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead === 'true';
    }

    if (filters.range) {
      const now = new Date();
      let startDate = new Date();
      switch (filters.range) {
        case '7d': startDate.setDate(now.getDate() - 7); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case '90d': startDate.setDate(now.getDate() - 90); break;
        case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
        default: startDate = null; break;
      }
      if (startDate) {
        where.timestamp = { gte: startDate };
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const page = parseInt(filters.page) || 1;
    const limit = Math.min(parseInt(filters.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, role: true } },
          issue: { select: { title: true } },
          assignment: { select: { status: true } }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        timestamp: n.timestamp,
        issueId: n.issueId,
        issueTitle: n.issue?.title,
        assignmentId: n.assignmentId,
        recipientRole: n.user?.role?.name,
        recipientEmail: n.user?.email
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAnalytics(range = '30d') {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      case '90d': startDate.setDate(now.getDate() - 90); break;
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate.setDate(now.getDate() - 30); break;
    }

    const dateFilter = {
      gte: startDate
    };
    
    // Summary Metrics
    const totalUsers = await prisma.user.count({ where: { createdAt: dateFilter } });
    const totalIssues = await prisma.issue.count({ where: { createdAt: dateFilter } });
    const resolvedIssues = await prisma.issue.count({ where: { createdAt: dateFilter, status: 'RESOLVED' } });
    const openIssues = await prisma.issue.count({ where: { createdAt: dateFilter, status: { notIn: ['RESOLVED', 'CANCELLED', 'REJECTED'] } } });
    
    const totalAssignments = await prisma.workAssignment.count({ where: { assignedDate: dateFilter } });
    const completedAssignments = await prisma.workAssignment.count({ where: { assignedDate: dateFilter, status: 'COMPLETED' } });
    
    const totalPayments = await prisma.payment.count({ where: { createdAt: dateFilter } });
    const completedPayments = await prisma.payment.count({ where: { createdAt: dateFilter, status: 'COMPLETED' } });
    
    const paymentAggregate = await prisma.payment.aggregate({
      where: { createdAt: dateFilter, status: 'COMPLETED' },
      _sum: { amount: true }
    });
    const totalPaidAmount = paymentAggregate._sum.amount ? parseFloat(paymentAggregate._sum.amount) : 0;

    // Issue Status Distribution
    const issuesByStatus = await prisma.issue.groupBy({
      by: ['status'],
      where: { createdAt: dateFilter },
      _count: { id: true }
    });
    const issueStatusDistribution = issuesByStatus.map(i => ({ status: i.status, count: i._count.id }));

    // Issue Priority Distribution
    const issuesByPriority = await prisma.issue.groupBy({
      by: ['priority'],
      where: { createdAt: dateFilter },
      _count: { id: true }
    });
    const issuePriorityDistribution = issuesByPriority.map(i => ({ priority: i.priority, count: i._count.id }));

    // Issue Category Distribution
    const issuesByCategory = await prisma.issue.groupBy({
      by: ['categoryId'],
      where: { createdAt: dateFilter },
      _count: { id: true }
    });
    
    const categories = await prisma.issueCategory.findMany();
    const categoryMap = categories.reduce((acc, cat) => { acc[cat.id] = cat.name; return acc; }, {});
    const issueCategoryDistribution = issuesByCategory.map(i => ({ category: categoryMap[i.categoryId] || 'Unknown', count: i._count.id }));

    // Assignment Distribution
    const assignmentsByStatus = await prisma.workAssignment.groupBy({
      by: ['status'],
      where: { assignedDate: dateFilter },
      _count: { id: true }
    });
    const assignmentDistribution = assignmentsByStatus.map(a => ({ status: a.status, count: a._count.id }));

    // Verification Distribution
    const beforeVerifications = await prisma.beforeWorkVerification.groupBy({
      by: ['status'],
      where: { timestamp: dateFilter },
      _count: { id: true }
    });
    const afterVerifications = await prisma.afterWorkVerification.groupBy({
      by: ['status'],
      where: { timestamp: dateFilter },
      _count: { id: true }
    });
    
    const verificationDistribution = [
      ...beforeVerifications.map(v => ({ type: 'Before Work', status: v.status, count: v._count.id })),
      ...afterVerifications.map(v => ({ type: 'After Work', status: v.status, count: v._count.id }))
    ];

    // User Role Distribution
    const usersByRole = await prisma.user.groupBy({
      by: ['roleId'],
      where: { createdAt: dateFilter },
      _count: { id: true }
    });
    const roles = await prisma.role.findMany();
    const roleMap = roles.reduce((acc, role) => { acc[role.id] = role.name; return acc; }, {});
    const userRoleDistribution = usersByRole.map(u => ({ role: roleMap[u.roleId] || 'Unknown', count: u._count.id }));

    // Trend calculations
    const issuesForTrend = await prisma.issue.findMany({
      where: { createdAt: dateFilter },
      select: { createdAt: true, status: true, statusHistory: { select: { timestamp: true, newStatus: true } } }
    });
    
    const paymentsForTrend = await prisma.payment.findMany({
      where: { createdAt: dateFilter, status: 'COMPLETED' },
      select: { createdAt: true, amount: true }
    });

    const issueTrendMap = {};
    let resolutionHoursTotal = 0;
    let resolutionCountActual = 0;

    issuesForTrend.forEach(issue => {
      const dateStr = issue.createdAt.toISOString().split('T')[0];
      if (!issueTrendMap[dateStr]) issueTrendMap[dateStr] = { period: dateStr, reported: 0, resolved: 0 };
      issueTrendMap[dateStr].reported += 1;

      const resolutionLog = issue.statusHistory?.find(h => h.newStatus === 'RESOLVED');
      if (resolutionLog) {
        const resDateStr = resolutionLog.timestamp.toISOString().split('T')[0];
        if (!issueTrendMap[resDateStr]) issueTrendMap[resDateStr] = { period: resDateStr, reported: 0, resolved: 0 };
        issueTrendMap[resDateStr].resolved += 1;
        
        const hours = (resolutionLog.timestamp - issue.createdAt) / (1000 * 60 * 60);
        resolutionHoursTotal += hours;
        resolutionCountActual += 1;
      }
    });

    const paymentTrendMap = {};
    paymentsForTrend.forEach(payment => {
      const dateStr = payment.createdAt.toISOString().split('T')[0];
      if (!paymentTrendMap[dateStr]) paymentTrendMap[dateStr] = { period: dateStr, amount: 0, transactionCount: 0 };
      paymentTrendMap[dateStr].amount += parseFloat(payment.amount);
      paymentTrendMap[dateStr].transactionCount += 1;
    });

    const issueTrend = Object.values(issueTrendMap).sort((a, b) => a.period.localeCompare(b.period));
    const paymentTrend = Object.values(paymentTrendMap).sort((a, b) => a.period.localeCompare(b.period));
    
    const averageResolutionHours = resolutionCountActual > 0 ? (resolutionHoursTotal / resolutionCountActual).toFixed(1) : null;

    return {
      summary: {
        totalUsers,
        totalIssues,
        resolvedIssues,
        openIssues,
        totalAssignments,
        completedAssignments,
        totalPayments,
        completedPayments,
        totalPaidAmount
      },
      issueStatusDistribution,
      issuePriorityDistribution,
      issueCategoryDistribution,
      issueTrend,
      assignmentDistribution,
      verificationDistribution,
      paymentTrend,
      userRoleDistribution,
      resolutionMetrics: {
        averageResolutionHours: averageResolutionHours ? parseFloat(averageResolutionHours) : null,
        resolvedCount: resolutionCountActual
      }
    };
  }

  async getSettings() {
    const { BEFORE_WORK_MAX_DISTANCE_KM } = require('../config/constants');
    
    // Check DB connection status
    let dbStatus = 'Disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'Connected';
    } catch (e) {
      dbStatus = 'Error';
    }

    const categories = await prisma.issueCategory.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' }
    });

    return {
      system: {
        environment: process.env.NODE_ENV || 'development',
        dbStatus,
        apiStatus: 'Online'
      },
      issueConfiguration: {
        categories,
        priorities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
      },
      verificationSettings: {
        beforeWorkMaxDistanceKm: BEFORE_WORK_MAX_DISTANCE_KM
      },
      notificationSettings: {
        types: ['INFO', 'ALERT', 'ASSIGNMENT', 'PAYMENT', 'ISSUE_UPDATE']
      }
    };
  }

  async getAllAppraisals(filters) {
    const where = {};
    if (filters.workerId) where.workerId = filters.workerId;
    if (filters.managerId) where.managerId = filters.managerId;
    if (filters.status) where.status = filters.status;
    if (filters.overallRating) where.overallRating = filters.overallRating;
    
    if (filters.startDate || filters.endDate) {
      where.periodEnd = {};
      if (filters.startDate) where.periodEnd.gte = new Date(filters.startDate);
      if (filters.endDate) where.periodEnd.lte = new Date(filters.endDate);
    }

    const page = parseInt(filters.page) || 1;
    const limit = Math.min(parseInt(filters.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const [total, appraisals] = await Promise.all([
      prisma.workerAppraisal.count({ where }),
      prisma.workerAppraisal.findMany({
        where,
        include: {
          worker: { include: { user: { select: { id: true, email: true, phone: true } } } },
          manager: { include: { user: { select: { id: true, email: true, phone: true } } } }
        },
        orderBy: { periodEnd: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      appraisals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAppraisalDetail(id) {
    return prisma.workerAppraisal.findUnique({
      where: { id },
      include: {
        worker: { include: { user: { select: { id: true, email: true, phone: true } } } },
        manager: { include: { user: { select: { id: true, email: true, phone: true } } } }
      }
    });
  }
}

module.exports = new SuperAdminService();
