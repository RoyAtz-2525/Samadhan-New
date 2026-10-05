const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const workerService = require('./workerService');

// Haversine distance calculation in kilometers
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
};

const getDashboardMetrics = async (managerUserId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager profile not found');
    error.statusCode = 404;
    throw error;
  }

  const approvedIssuesCount = await prisma.issue.count({
    where: { status: 'APPROVED' }
  });

  const myAssignmentsCount = await prisma.workAssignment.count({
    where: { managerId: manager.id, status: { not: 'COMPLETED' } }
  });

  const availableWorkersCount = await prisma.workerProfile.count({
    where: { status: 'AVAILABLE', isVerified: true }
  });

  const pendingVerificationsCount = await prisma.beforeWorkVerification.count({
    where: {
      assignment: { managerId: manager.id },
      status: 'PENDING'
    }
  });

  const pendingAfterVerificationsCount = await prisma.afterWorkVerification.count({
    where: {
      assignment: { managerId: manager.id },
      status: 'PENDING'
    }
  });

  return {
    approvedIssues: approvedIssuesCount,
    activeAssignments: myAssignmentsCount,
    availableWorkers: availableWorkersCount,
    pendingVerifications: pendingVerificationsCount,
    pendingAfterVerifications: pendingAfterVerificationsCount
  };
};

const getApprovedIssues = async (filters = {}) => {
  const query = {
    where: { status: 'APPROVED' },
    include: {
      category: true,
      reporter: {
        include: {
          user: { select: { email: true, phone: true } }
        }
      },
      _count: {
        select: { media: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  };

  if (filters.category) {
    query.where.categoryId = filters.category;
  }
  if (filters.priority) {
    query.where.priority = filters.priority;
  }

  return await prisma.issue.findMany(query);
};

const getIssueDetails = async (issueId) => {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, status: 'APPROVED' },
    include: {
      category: true,
      reporter: {
        include: { user: { select: { email: true, phone: true } } }
      },
      media: true,
      statusHistory: {
        orderBy: { timestamp: 'desc' },
        include: {
          changedBy: { select: { email: true } }
        }
      }
    }
  });

  if (!issue) {
    const error = new Error('Approved issue not found');
    error.statusCode = 404;
    throw error;
  }
  return issue;
};

const getWorkers = async (filters = {}, issueLat = null, issueLon = null) => {
  const query = {
    include: {
      user: { select: { email: true, phone: true } },
      skills: true,
      location: true,
      availability: true
    }
  };

  const whereClause = {};
  
  if (filters.status) {
    whereClause.status = filters.status;
  }
  
  if (Object.keys(whereClause).length > 0) {
    query.where = whereClause;
  }

  const workers = await prisma.workerProfile.findMany(query);

  return workers.map(worker => {
    let distanceKm = null;
    if (issueLat && issueLon && worker.location?.latitude && worker.location?.longitude) {
      distanceKm = calculateDistanceKm(
        parseFloat(issueLat), parseFloat(issueLon),
        worker.location.latitude, worker.location.longitude
      );
    }
    
    return {
      ...worker,
      distanceKm: distanceKm !== null ? Number(distanceKm.toFixed(2)) : null
    };
  }).sort((a, b) => {
    if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm !== null) return -1;
    if (b.distanceKm !== null) return 1;
    return 0;
  });
};

const getWorkerDetails = async (workerId) => {
  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
    include: {
      user: { select: { email: true, phone: true } },
      skills: true,
      availability: true,
      location: true,
      assignments: {
        where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } },
        include: { issue: { select: { title: true } } }
      }
    }
  });

  if (!worker) {
    const error = new Error('Worker not found');
    error.statusCode = 404;
    throw error;
  }

  return worker;
};

const createAssignment = async (managerUserId, payload) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager profile not found');
    error.statusCode = 403;
    throw error;
  }

  const issue = await prisma.issue.findUnique({
    where: { id: payload.issueId }
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  if (issue.status !== 'APPROVED') {
    const error = new Error('Only APPROVED issues can be assigned');
    error.statusCode = 400;
    throw error;
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { id: payload.workerId },
    include: { user: true }
  });

  if (!worker || worker.user.status !== 'ACTIVE') {
    const error = new Error('Worker is invalid or inactive');
    error.statusCode = 400;
    throw error;
  }

  // Check if already assigned
  const existingAssignment = await prisma.workAssignment.findFirst({
    where: {
      issueId: payload.issueId,
      workerId: payload.workerId,
      status: { notIn: ['CANCELLED', 'REJECTED'] }
    }
  });

  if (existingAssignment) {
    const error = new Error('Worker is already assigned to this issue');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create WorkAssignment
    const assignment = await tx.workAssignment.create({
      data: {
        issueId: payload.issueId,
        workerId: payload.workerId,
        managerId: manager.id,
        assignedRate: payload.rate,
        notes: payload.notes || null,
        status: 'PENDING'
      }
    });

    // 2. Update Issue Status
    await tx.issue.update({
      where: { id: payload.issueId },
      data: { status: 'ASSIGNED' }
    });

    // 3. Assignment Status History
    await tx.assignmentStatusHistory.create({
      data: {
        assignmentId: assignment.id,
        oldStatus: 'PENDING',
        newStatus: 'PENDING',
        changedById: managerUserId,
        reason: 'Initial assignment'
      }
    });
    
    // Create issue status history
    await tx.issueStatusHistory.create({
      data: {
        issueId: payload.issueId,
        oldStatus: 'APPROVED',
        newStatus: 'ASSIGNED',
        changedById: managerUserId,
        reason: 'Assigned to worker'
      }
    });

    // 4. Create Notification for Worker
    await tx.notification.create({
      data: {
        userId: worker.userId,
        type: 'ASSIGNMENT',
        title: 'New Work Assignment',
        message: `You have been assigned a new civic issue: ${issue.title}.`,
        issueId: issue.id,
        assignmentId: assignment.id
      }
    });

    return assignment;
  });
};

const getAssignments = async (managerUserId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) return [];

  return await prisma.workAssignment.findMany({
    where: { managerId: manager.id },
    include: {
      issue: { select: { title: true, status: true, id: true } },
      worker: { include: { user: { select: { email: true } } } }
    },
    orderBy: { assignedDate: 'desc' }
  });
};

const getAssignmentDetails = async (managerUserId, assignmentId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager not found');
    error.statusCode = 403;
    throw error;
  }

  const assignment = await prisma.workAssignment.findFirst({
    where: { id: assignmentId, managerId: manager.id },
    include: {
      issue: true,
      worker: { include: { user: true, skills: true } },
      statusHistory: { orderBy: { timestamp: 'desc' } },
      beforeVerification: true,
      progressRecords: { include: { media: true }, orderBy: { createdAt: 'asc' } }
    }
  });

  if (!assignment) {
    const error = new Error('Assignment not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  return assignment;
};

const getWorkerPerformance = async (managerUserId, workerId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager not found');
    error.statusCode = 403;
    throw error;
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId }
  });

  if (!worker) {
    const error = new Error('Worker not found');
    error.statusCode = 404;
    throw error;
  }

  return await workerService.getPerformanceMetricsByWorkerId(workerId);
};

// Manager Appraisal Methods

const createAppraisal = async (managerUserId, workerId, payload) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager not found');
    error.statusCode = 403;
    throw error;
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId }
  });

  if (!worker) {
    const error = new Error('Worker not found');
    error.statusCode = 404;
    throw error;
  }

  // Check for overlapping duplicate periods
  const existingAppraisals = await prisma.workerAppraisal.findMany({
    where: {
      workerId,
      managerId: manager.id,
      OR: [
        {
          periodStart: { lte: new Date(payload.periodEnd) },
          periodEnd: { gte: new Date(payload.periodStart) }
        }
      ]
    }
  });

  if (existingAppraisals.length > 0) {
    const error = new Error('An appraisal for this worker already exists in the given period.');
    error.statusCode = 400;
    throw error;
  }

  const appraisal = await prisma.workerAppraisal.create({
    data: {
      workerId,
      managerId: manager.id,
      periodStart: new Date(payload.periodStart),
      periodEnd: new Date(payload.periodEnd),
      overallRating: payload.overallRating,
      workQualityRating: payload.workQualityRating,
      timelinessRating: payload.timelinessRating,
      reliabilityRating: payload.reliabilityRating,
      professionalismRating: payload.professionalismRating,
      communicationRating: payload.communicationRating,
      strengths: payload.strengths,
      areasForImprovement: payload.areasForImprovement,
      managerComments: payload.managerComments,
      goalsAndRecommendations: payload.goalsAndRecommendations,
      status: 'DRAFT'
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: managerUserId,
      action: 'APPRAISAL_CREATED',
      entityType: 'APPRAISAL',
      entityId: appraisal.id,
      metadata: { workerId }
    }
  });

  return appraisal;
};

const getAppraisals = async (managerUserId, workerId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager not found');
    error.statusCode = 403;
    throw error;
  }

  const appraisals = await prisma.workerAppraisal.findMany({
    where: { workerId, managerId: manager.id },
    orderBy: { periodEnd: 'desc' }
  });

  return appraisals;
};

const getAppraisalDetails = async (managerUserId, appraisalId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager not found');
    error.statusCode = 403;
    throw error;
  }

  const appraisal = await prisma.workerAppraisal.findFirst({
    where: { id: appraisalId, managerId: manager.id },
    include: {
      worker: {
        include: {
          user: {
            select: { email: true }
          }
        }
      }
    }
  });

  if (!appraisal) {
    const error = new Error('Appraisal not found');
    error.statusCode = 404;
    throw error;
  }

  return appraisal;
};

const updateAppraisal = async (managerUserId, appraisalId, payload) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager not found');
    error.statusCode = 403;
    throw error;
  }

  const existingAppraisal = await prisma.workerAppraisal.findFirst({
    where: { id: appraisalId, managerId: manager.id }
  });

  if (!existingAppraisal) {
    const error = new Error('Appraisal not found');
    error.statusCode = 404;
    throw error;
  }

  if (existingAppraisal.status !== 'DRAFT') {
    const error = new Error('Only draft appraisals can be updated');
    error.statusCode = 400;
    throw error;
  }

  const updateData = {};
  
  if (payload.periodStart) updateData.periodStart = new Date(payload.periodStart);
  if (payload.periodEnd) updateData.periodEnd = new Date(payload.periodEnd);
  
  if (updateData.periodStart || updateData.periodEnd) {
    const pStart = updateData.periodStart || existingAppraisal.periodStart;
    const pEnd = updateData.periodEnd || existingAppraisal.periodEnd;
    
    // Check overlapping excluding self
    const overlaps = await prisma.workerAppraisal.findMany({
      where: {
        workerId: existingAppraisal.workerId,
        managerId: manager.id,
        id: { not: appraisalId },
        OR: [
          {
            periodStart: { lte: pEnd },
            periodEnd: { gte: pStart }
          }
        ]
      }
    });

    if (overlaps.length > 0) {
      const error = new Error('An appraisal for this worker already exists in the given period.');
      error.statusCode = 400;
      throw error;
    }
  }

  ['overallRating', 'workQualityRating', 'timelinessRating', 'reliabilityRating', 'professionalismRating', 'communicationRating'].forEach(field => {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  });

  ['strengths', 'areasForImprovement', 'managerComments', 'goalsAndRecommendations'].forEach(field => {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  });

  const appraisal = await prisma.workerAppraisal.update({
    where: { id: appraisalId },
    data: updateData
  });

  return appraisal;
};

const submitAppraisal = async (managerUserId, appraisalId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId: managerUserId }
  });

  if (!manager) {
    const error = new Error('Manager not found');
    error.statusCode = 403;
    throw error;
  }

  const existingAppraisal = await prisma.workerAppraisal.findFirst({
    where: { id: appraisalId, managerId: manager.id },
    include: {
      worker: true
    }
  });

  if (!existingAppraisal) {
    const error = new Error('Appraisal not found');
    error.statusCode = 404;
    throw error;
  }

  if (existingAppraisal.status !== 'DRAFT') {
    const error = new Error('Only draft appraisals can be submitted');
    error.statusCode = 400;
    throw error;
  }

  // Ensure all ratings are present
  const requiredRatings = ['overallRating', 'workQualityRating', 'timelinessRating', 'reliabilityRating', 'professionalismRating', 'communicationRating'];
  for (const field of requiredRatings) {
    if (existingAppraisal[field] === null || existingAppraisal[field] === undefined) {
      const error = new Error(`Cannot submit appraisal: ${field} is missing.`);
      error.statusCode = 400;
      throw error;
    }
  }

  const result = await prisma.$transaction(async (prisma) => {
    const appraisal = await prisma.workerAppraisal.update({
      where: { id: appraisalId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    await prisma.notification.create({
      data: {
        userId: existingAppraisal.worker.userId,
        type: 'APPRAISAL',
        title: 'Performance Appraisal Submitted',
        message: 'Your manager has submitted a performance appraisal for you.',
        appraisalId: appraisal.id
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: managerUserId,
        action: 'APPRAISAL_SUBMITTED',
        entityType: 'APPRAISAL',
        entityId: appraisal.id
      }
    });

    return appraisal;
  });

  return result;
};

module.exports = {
  getDashboardMetrics,
  getApprovedIssues,
  getIssueDetails,
  getWorkers,
  getWorkerDetails,
  createAssignment,
  getAssignments,
  getAssignmentDetails,
  getWorkerPerformance,
  createAppraisal,
  getAppraisals,
  getAppraisalDetails,
  updateAppraisal,
  submitAppraisal
};
