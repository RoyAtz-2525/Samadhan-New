const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWorkerProfile = async (userId) => {
  const profile = await prisma.workerProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    const error = new Error('Worker profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

const getDashboardMetrics = async (userId) => {
  const worker = await getWorkerProfile(userId);

  const pending = await prisma.workAssignment.count({
    where: { workerId: worker.id, status: 'PENDING' }
  });
  
  const accepted = await prisma.workAssignment.count({
    where: { workerId: worker.id, status: 'ACCEPTED' }
  });

  const rejected = await prisma.workAssignment.count({
    where: { workerId: worker.id, status: 'REJECTED' }
  });

  const active = await prisma.workAssignment.count({
    where: { workerId: worker.id, status: { in: ['ACCEPTED', 'IN_PROGRESS'] } }
  });

  const total = await prisma.workAssignment.count({
    where: { workerId: worker.id }
  });

  return {
    pending,
    accepted,
    rejected,
    active,
    total
  };
};

const getAssignments = async (userId, statusFilter) => {
  const worker = await getWorkerProfile(userId);

  const whereClause = { workerId: worker.id };
  if (statusFilter && ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'].includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  return await prisma.workAssignment.findMany({
    where: whereClause,
    include: {
      issue: { select: { title: true, category: true, priority: true, address: true, status: true } },
      manager: { include: { user: { select: { email: true, phone: true } } } }
    },
    orderBy: { assignedDate: 'desc' }
  });
};

const getAssignmentDetails = async (userId, assignmentId) => {
  const worker = await getWorkerProfile(userId);

  const assignment = await prisma.workAssignment.findFirst({
    where: { id: assignmentId, workerId: worker.id },
    include: {
      issue: { include: { category: true, media: true } },
      manager: { include: { user: { select: { email: true, phone: true } } } },
      statusHistory: { orderBy: { timestamp: 'desc' } },
      beforeWorkVerification: { orderBy: { timestamp: 'desc' }, take: 1 }
    }
  });

  if (!assignment) {
    const error = new Error('Assignment not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  return assignment;
};

const respondToAssignment = async (userId, assignmentId, payload) => {
  const worker = await getWorkerProfile(userId);
  const { action, reason } = payload;

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch assignment and lock it for update if DB supports it.
    // In Prisma, checking the state inline prevents race conditions.
    const assignment = await tx.workAssignment.findFirst({
      where: { id: assignmentId, workerId: worker.id }
    });

    if (!assignment) {
      const error = new Error('Assignment not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    if (assignment.status !== 'PENDING') {
      const error = new Error(`Cannot ${action} assignment. Current status is ${assignment.status}`);
      error.statusCode = 400;
      throw error;
    }

    const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';

    // 2. Perform conditional update to handle concurrency properly
    const updatedAssignment = await tx.workAssignment.updateMany({
      where: {
        id: assignmentId,
        workerId: worker.id,
        status: 'PENDING' // Ensures it's still PENDING at the moment of update
      },
      data: {
        status: newStatus
      }
    });

    if (updatedAssignment.count === 0) {
      const error = new Error(`Failed to ${action} assignment. It may have already been updated.`);
      error.statusCode = 409; // Conflict
      throw error;
    }

    // 3. Create Status History
    await tx.assignmentStatusHistory.create({
      data: {
        assignmentId,
        oldStatus: 'PENDING',
        newStatus,
        changedById: userId,
        reason: action === 'REJECT' ? reason : 'Accepted by worker'
      }
    });

    // 4. Fetch manager user ID to send notification
    const manager = await tx.managerProfile.findUnique({
      where: { id: assignment.managerId }
    });

    if (manager) {
      await tx.notification.create({
        data: {
          userId: manager.userId,
          type: 'ASSIGNMENT',
          title: `Assignment ${newStatus}`,
          message: `Worker has ${newStatus.toLowerCase()} the assigned civic issue.`,
          issueId: assignment.issueId,
          assignmentId: assignment.id
        }
      });
    }

    return await tx.workAssignment.findUnique({
      where: { id: assignmentId }
    });
  });
};

const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper'); // Need to import

const getWorkExecution = async (userId, assignmentId) => {
  const worker = await getWorkerProfile(userId);

  const assignment = await prisma.workAssignment.findFirst({
    where: { id: assignmentId, workerId: worker.id },
    include: {
      issue: { select: { title: true, status: true, description: true } },
      progressRecords: {
        include: { media: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!assignment) {
    const error = new Error('Assignment not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  return assignment;
};

const validateWorkExecutionState = async (userId, assignmentId) => {
  const worker = await getWorkerProfile(userId);
  const assignment = await prisma.workAssignment.findFirst({
    where: { id: assignmentId, workerId: worker.id },
    include: { issue: true, beforeVerification: true }
  });

  if (!assignment) {
    const error = new Error('Assignment not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  if (assignment.status !== 'IN_PROGRESS') {
    const error = new Error(`Assignment is not IN_PROGRESS (current: ${assignment.status})`);
    error.statusCode = 409;
    throw error;
  }
  if (assignment.issue.status !== 'WORK_STARTED') {
    const error = new Error(`Issue is not WORK_STARTED (current: ${assignment.issue.status})`);
    error.statusCode = 409;
    throw error;
  }
  if (!assignment.beforeVerification || assignment.beforeVerification.status !== 'APPROVED') {
    const error = new Error('Before-work verification is not APPROVED');
    error.statusCode = 409;
    throw error;
  }
  return assignment;
};

const submitWorkProgress = async (userId, assignmentId, payload, files) => {
  const assignment = await validateWorkExecutionState(userId, assignmentId);
  const note = payload.note;

  let uploadedMedia = [];
  try {
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadToCloudinary(file, 'work-execution', assignment.id);
        uploadedMedia.push({
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type.toUpperCase(),
          format: result.format,
          bytes: result.bytes
        });
      }
    }

    const progressRecord = await prisma.workProgressRecord.create({
      data: {
        assignmentId,
        note,
        media: {
          create: uploadedMedia
        }
      },
      include: { media: true }
    });

    return progressRecord;
  } catch (err) {
    // Cleanup on fail
    for (const m of uploadedMedia) {
      await deleteFromCloudinary(m.publicId, m.type.toLowerCase());
    }
    const error = new Error('Failed to save progress update: ' + err.message);
    error.statusCode = 500;
    throw error;
  }
};

const completeWork = async (userId, assignmentId, payload, files) => {
  const assignment = await validateWorkExecutionState(userId, assignmentId);
  const note = payload.note;

  if (!files || files.length === 0) {
    const error = new Error('Completion evidence (media) is required');
    error.statusCode = 400;
    throw error;
  }

  let uploadedMedia = [];
  try {
    for (const file of files) {
      const result = await uploadToCloudinary(file, 'work-execution', assignment.id);
      uploadedMedia.push({
        url: result.secure_url,
        publicId: result.public_id,
        type: result.resource_type.toUpperCase(),
        format: result.format,
        bytes: result.bytes
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create progress record with media
      const progressRecord = await tx.workProgressRecord.create({
        data: {
          assignmentId,
          note,
          media: {
            create: uploadedMedia
          }
        },
        include: { media: true }
      });

      // Update assignment
      const updatedAssignment = await tx.workAssignment.updateMany({
        where: { id: assignmentId, status: 'IN_PROGRESS' },
        data: { status: 'COMPLETED' }
      });
      if (updatedAssignment.count === 0) {
        throw new Error('Assignment status changed concurrently');
      }

      // Update issue
      const updatedIssue = await tx.issue.updateMany({
        where: { id: assignment.issueId, status: 'WORK_STARTED' },
        data: { status: 'WORK_COMPLETED' }
      });
      if (updatedIssue.count === 0) {
        throw new Error('Issue status changed concurrently');
      }

      // Assignment history
      await tx.assignmentStatusHistory.create({
        data: {
          assignmentId,
          oldStatus: 'IN_PROGRESS',
          newStatus: 'COMPLETED',
          changedById: userId,
          reason: 'Worker completed work'
        }
      });

      // Issue history
      await tx.issueStatusHistory.create({
        data: {
          issueId: assignment.issueId,
          oldStatus: 'WORK_STARTED',
          newStatus: 'WORK_COMPLETED',
          changedById: userId,
          reason: 'Work Execution Completed'
        }
      });

      // Notify manager
      const manager = await tx.managerProfile.findUnique({
        where: { id: assignment.managerId }
      });
      if (manager) {
        await tx.notification.create({
          data: {
            userId: manager.userId,
            type: 'ASSIGNMENT',
            title: 'Work Completed',
            message: 'The assigned work has been completed and is ready for verification.',
            issueId: assignment.issueId,
            assignmentId: assignment.id
          }
        });
      }

      return progressRecord;
    }, {
      maxWait: 15000,
      timeout: 20000
    });

    return result;
  } catch (err) {
    for (const m of uploadedMedia) {
      await deleteFromCloudinary(m.publicId, m.type.toLowerCase());
    }
    const error = new Error('Failed to complete work: ' + err.message);
    error.statusCode = err.message.includes('concurrently') ? 409 : 500;
    throw error;
  }
};

const getPerformanceMetricsByWorkerId = async (workerId) => {
  // 1. Assignment Metrics
  const assignments = await prisma.workAssignment.groupBy({
    by: ['status'],
    where: { workerId },
    _count: { status: true }
  });

  let totalAssignments = 0;
  let acceptedAssignments = 0;
  let rejectedAssignments = 0;
  let completedAssignments = 0;
  let cancelledAssignments = 0;

  assignments.forEach(a => {
    totalAssignments += a._count.status;
    if (a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS' || a.status === 'COMPLETED') acceptedAssignments += a._count.status;
    if (a.status === 'REJECTED') rejectedAssignments += a._count.status;
    if (a.status === 'COMPLETED') completedAssignments += a._count.status;
    if (a.status === 'CANCELLED') cancelledAssignments += a._count.status;
  });

  const totalDecided = acceptedAssignments + rejectedAssignments;
  const acceptanceRate = totalDecided > 0 ? (acceptedAssignments / totalDecided) * 100 : 0;
  const completionRate = acceptedAssignments > 0 ? (completedAssignments / acceptedAssignments) * 100 : 0;

  const assignmentMetrics = {
    totalAssignments,
    acceptedAssignments,
    rejectedAssignments,
    completedAssignments,
    cancelledAssignments,
    acceptanceRate: Math.round(acceptanceRate * 10) / 10,
    completionRate: Math.round(completionRate * 10) / 10
  };

  // 2. Completion Time
  const history = await prisma.assignmentStatusHistory.findMany({
    where: { 
      assignment: { workerId, status: 'COMPLETED' },
      newStatus: { in: ['IN_PROGRESS', 'COMPLETED'] }
    },
    orderBy: { timestamp: 'asc' }
  });
  
  const timeByAssignment = {};
  history.forEach(h => {
    if (!timeByAssignment[h.assignmentId]) timeByAssignment[h.assignmentId] = {};
    if (h.newStatus === 'IN_PROGRESS' && !timeByAssignment[h.assignmentId].start) {
      timeByAssignment[h.assignmentId].start = h.timestamp;
    }
    if (h.newStatus === 'COMPLETED' && !timeByAssignment[h.assignmentId].end) {
      timeByAssignment[h.assignmentId].end = h.timestamp;
    }
  });

  let totalHours = 0;
  let validCompletions = 0;
  Object.values(timeByAssignment).forEach(t => {
    if (t.start && t.end) {
      totalHours += (new Date(t.end) - new Date(t.start)) / (1000 * 60 * 60);
      validCompletions++;
    }
  });

  const completionMetrics = {
    averageCompletionHours: validCompletions > 0 ? Math.round((totalHours / validCompletions) * 10) / 10 : null
  };

  // 3. Verification Quality
  const verifications = await prisma.afterWorkVerification.groupBy({
    by: ['status'],
    where: { workerId },
    _count: { status: true }
  });

  let totalVerifications = 0;
  let approved = 0;
  let rejected = 0;
  let revisionRequested = 0;

  verifications.forEach(v => {
    totalVerifications += v._count.status;
    if (v.status === 'APPROVED') approved += v._count.status;
    if (v.status === 'REJECTED') rejected += v._count.status;
    if (v.status === 'REVISION_REQUESTED') revisionRequested += v._count.status;
  });

  const verificationMetrics = {
    totalVerifications,
    approved,
    rejected,
    revisionRequested,
    approvalRate: totalVerifications > 0 ? Math.round((approved / totalVerifications) * 100) : 0,
    revisionRate: totalVerifications > 0 ? Math.round((revisionRequested / totalVerifications) * 100) : 0
  };

  // 4. Citizen Reviews
  const reviews = await prisma.review.findMany({
    where: { revieweeId: workerId }
  });

  let totalReviews = reviews.length;
  let totalRating = 0;
  const starCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach(r => {
    totalRating += r.rating;
    if (starCount[r.rating] !== undefined) starCount[r.rating]++;
  });

  const reviewMetrics = {
    totalReviews,
    averageRating: totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0,
    starDistribution: starCount
  };

  // 5. Earnings
  const payments = await prisma.payment.aggregate({
    where: { workerId, status: 'COMPLETED' },
    _count: { id: true },
    _sum: { amount: true }
  });

  const totalCompletedPayments = payments._count.id;
  const totalEarnings = payments._sum.amount ? parseFloat(payments._sum.amount) : 0;

  const earningsMetrics = {
    completedPayments: totalCompletedPayments,
    totalEarnings,
    averagePayment: totalCompletedPayments > 0 ? Math.round(totalEarnings / totalCompletedPayments) : 0
  };

  return {
    assignmentMetrics,
    completionMetrics,
    verificationMetrics,
    reviewMetrics,
    earningsMetrics
  };
};

const getPerformanceMetrics = async (userId) => {
  const worker = await getWorkerProfile(userId);
  return await getPerformanceMetricsByWorkerId(worker.id);
};

// Worker Appraisal Methods

const getAppraisals = async (userId) => {
  const worker = await getWorkerProfile(userId);
  const appraisals = await prisma.workerAppraisal.findMany({
    where: { workerId: worker.id },
    orderBy: { periodEnd: 'desc' },
    include: {
      manager: {
        include: {
          user: {
            select: { email: true }
          }
        }
      }
    }
  });

  // Filter out DRAFT appraisals from worker view
  return appraisals.filter(a => a.status !== 'DRAFT');
};

const getAppraisalDetails = async (userId, appraisalId) => {
  const worker = await getWorkerProfile(userId);
  const appraisal = await prisma.workerAppraisal.findFirst({
    where: { 
      id: appraisalId,
      workerId: worker.id
    },
    include: {
      manager: {
        include: {
          user: {
            select: { email: true }
          }
        }
      }
    }
  });

  if (!appraisal || appraisal.status === 'DRAFT') {
    const error = new Error('Appraisal not found');
    error.statusCode = 404;
    throw error;
  }

  return appraisal;
};

const acknowledgeAppraisal = async (userId, appraisalId) => {
  const worker = await getWorkerProfile(userId);
  const appraisal = await prisma.workerAppraisal.findFirst({
    where: { 
      id: appraisalId,
      workerId: worker.id
    },
    include: {
      manager: true
    }
  });

  if (!appraisal || appraisal.status === 'DRAFT') {
    const error = new Error('Appraisal not found');
    error.statusCode = 404;
    throw error;
  }

  if (appraisal.status !== 'SUBMITTED') {
    const error = new Error('Only submitted appraisals can be acknowledged');
    error.statusCode = 400;
    throw error;
  }

  const result = await prisma.$transaction(async (prisma) => {
    const updatedAppraisal = await prisma.workerAppraisal.update({
      where: { id: appraisalId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date()
      }
    });

    await prisma.notification.create({
      data: {
        userId: appraisal.manager.userId,
        type: 'APPRAISAL',
        title: 'Appraisal Acknowledged',
        message: 'Worker has acknowledged the performance appraisal.',
        appraisalId: appraisal.id
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'APPRAISAL_ACKNOWLEDGED',
        entityType: 'APPRAISAL',
        entityId: appraisal.id
      }
    });

    return updatedAppraisal;
  });

  return result;
};


const updateWorkerLocation = async (userId, latitude, longitude) => {
    const profile = await prisma.workerProfile.findUnique({
        where: { userId },
        select: { id: true }
    });

    if (!profile) throw new ApiError(404, 'Worker profile not found');

    const location = await prisma.workerLocation.upsert({
        where: { workerId: profile.id },
        update: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            isOnline: true,
            lastUpdated: new Date()
        },
        create: {
            workerId: profile.id,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            isOnline: true
        }
    });

    return location;
};

module.exports = {
    updateWorkerLocation,
  getDashboardMetrics,
  getAssignments,
  getAssignmentDetails,
  respondToAssignment,
  getWorkExecution,
  submitWorkProgress,
  completeWork,
  getPerformanceMetrics,
  getPerformanceMetricsByWorkerId,
  getAppraisals,
  getAppraisalDetails,
  acknowledgeAppraisal
};
