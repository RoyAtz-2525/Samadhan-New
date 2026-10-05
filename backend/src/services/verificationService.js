const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createError = require('http-errors');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { BEFORE_WORK_MAX_DISTANCE_KM } = require('../config/constants');

// Haversine distance formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const crypto = require('crypto');

const getBeforeVerification = async (userId, assignmentId) => {
  const worker = await prisma.workerProfile.findUnique({
    where: { userId }
  });
  if (!worker) throw createError(404, 'Worker profile not found');

  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId, workerId: worker.id },
    include: { issue: true }
  });
  if (!assignment) throw createError(404, 'Assignment not found or does not belong to you');

  const verification = await prisma.beforeWorkVerification.findUnique({
    where: { assignmentId },
    include: { media: true }
  });

  return {
    verification,
    issue: {
      id: assignment.issue.id,
      title: assignment.issue.title,
      latitude: assignment.issue.latitude,
      longitude: assignment.issue.longitude,
      address: assignment.issue.address,
      status: assignment.issue.status
    },
    assignment: {
      id: assignment.id,
      status: assignment.status
    }
  };
};

const submitBeforeVerification = async (userId, assignmentId, data, files) => {
  const { latitude, longitude, siteCondition, notes } = data;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId }
  });
  if (!worker) throw createError(404, 'Worker profile not found');

  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId, workerId: worker.id },
    include: { 
      issue: true,
      manager: {
        include: { user: true }
      }
    }
  });

  if (!assignment) throw createError(404, 'Assignment not found or does not belong to you');

  if (assignment.status !== 'ACCEPTED') {
    throw createError(400, `Cannot verify. Assignment status is ${assignment.status}, expected ACCEPTED`);
  }

  const existingVerification = await prisma.beforeWorkVerification.findUnique({
    where: { assignmentId }
  });
  if (existingVerification) {
    throw createError(409, 'Before-work verification already submitted for this assignment');
  }

  // Location Verification
  const workerLat = parseFloat(latitude);
  const workerLon = parseFloat(longitude);
  const issueLat = assignment.issue.latitude;
  const issueLon = assignment.issue.longitude;

  const distanceKm = calculateDistance(workerLat, workerLon, issueLat, issueLon);

  if (distanceKm === null) {
    throw createError(400, 'Unable to calculate distance. Coordinates missing.');
  }

  if (distanceKm > BEFORE_WORK_MAX_DISTANCE_KM) {
    throw createError(400, `You are too far from the issue location. Distance: ${distanceKm.toFixed(2)} km. Max allowed: ${BEFORE_WORK_MAX_DISTANCE_KM} km.`);
  }

  // Pre-generate ID for Cloudinary folder structure
  const verificationId = crypto.randomUUID();
  const mediaRecords = [];

  try {
    // Upload Media outside of the transaction to avoid timeout
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadToCloudinary(file, 'before-work', verificationId);
        mediaRecords.push({
          url: result.secure_url,
          type: result.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
          publicId: result.public_id,
        });
      }
    }

    // Database Transaction
    const verification = await prisma.$transaction(async (tx) => {
      const createdVerification = await tx.beforeWorkVerification.create({
        data: {
          id: verificationId,
          assignmentId,
          workerId: worker.id,
          latitude: workerLat,
          longitude: workerLon,
          siteCondition,
          notes,
          status: 'PENDING',
          media: {
            create: mediaRecords
          }
        },
        include: {
          media: true
        }
      });

      if (assignment.manager && assignment.manager.user) {
        await tx.notification.create({
          data: {
            userId: assignment.manager.user.id,
            type: 'ASSIGNMENT',
            title: 'Before-Work Verification Submitted',
            message: `Worker has submitted before-work verification for Issue #${assignment.issue.id.substring(0, 8)}`,
            assignmentId: assignment.id,
            issueId: assignment.issue.id
          }
        });
      }

      return createdVerification;
    }, {
      maxWait: 15000,
      timeout: 20000
    });

    return {
      ...verification,
      distanceKm
    };
  } catch (error) {
    // Cleanup Cloudinary assets if anything failed
    for (const record of mediaRecords) {
      if (record.publicId) {
        await deleteFromCloudinary(record.publicId, record.type === 'VIDEO' ? 'video' : 'image');
      }
    }
    throw createError(500, 'Failed to submit verification: ' + error.message);
  }
};

const getManagerBeforeVerifications = async (userId, filters) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId }
  });
  if (!manager) throw createError(404, 'Manager profile not found');

  const whereClause = {
    assignment: {
      managerId: manager.id
    },
    status: filters.status
  };

  if (filters.priority) {
    whereClause.assignment.issue = { ...whereClause.assignment.issue, priority: filters.priority };
  }
  
  if (filters.categoryId) {
    whereClause.assignment.issue = { ...whereClause.assignment.issue, categoryId: filters.categoryId };
  }

  const verifications = await prisma.beforeWorkVerification.findMany({
    where: whereClause,
    include: {
      assignment: {
        include: {
          issue: {
            include: { category: true }
          }
        }
      },
      worker: {
        include: { user: true }
      },
      media: true
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  return verifications.map(v => {
    const distanceKm = calculateDistance(v.latitude, v.longitude, v.assignment.issue.latitude, v.assignment.issue.longitude);
    return {
      id: v.id,
      assignmentId: v.assignmentId,
      issueId: v.assignment.issue.id,
      issueTitle: v.assignment.issue.title,
      category: v.assignment.issue.category.name,
      priority: v.assignment.issue.priority,
      workerName: v.worker.user.name,
      workerId: v.worker.id,
      timestamp: v.timestamp,
      distanceKm,
      status: v.status,
      mediaCount: v.media.length
    };
  });
};

const getManagerBeforeVerificationDetails = async (userId, verificationId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId }
  });
  if (!manager) throw createError(404, 'Manager profile not found');

  const verification = await prisma.beforeWorkVerification.findUnique({
    where: { id: verificationId },
    include: {
      assignment: {
        include: {
          issue: {
            include: { category: true }
          },
          manager: {
            include: { user: true }
          }
        }
      },
      worker: {
        include: { 
          user: true,
          skills: true
        }
      },
      media: true
    }
  });

  if (!verification || verification.assignment.managerId !== manager.id) {
    throw createError(404, 'Verification not found or unauthorized access');
  }

  const distanceKm = calculateDistance(
    verification.latitude, 
    verification.longitude, 
    verification.assignment.issue.latitude, 
    verification.assignment.issue.longitude
  );

  return {
    issue: {
      id: verification.assignment.issue.id,
      title: verification.assignment.issue.title,
      description: verification.assignment.issue.description,
      category: verification.assignment.issue.category.name,
      priority: verification.assignment.issue.priority,
      address: verification.assignment.issue.address,
      latitude: verification.assignment.issue.latitude,
      longitude: verification.assignment.issue.longitude,
      status: verification.assignment.issue.status
    },
    worker: {
      id: verification.worker.id,
      name: verification.worker.user.name,
      experienceYears: verification.worker.experienceYears,
      skills: verification.worker.skills
    },
    assignment: {
      id: verification.assignment.id,
      assignedRate: verification.assignment.assignedRate,
      assignedDate: verification.assignment.assignedDate,
      status: verification.assignment.status,
      manager: verification.assignment.manager.user.name,
      notes: verification.assignment.notes
    },
    verification: {
      id: verification.id,
      status: verification.status,
      latitude: verification.latitude,
      longitude: verification.longitude,
      distanceKm,
      siteCondition: verification.siteCondition,
      notes: verification.notes,
      timestamp: verification.timestamp,
      media: verification.media
    }
  };
};

const reviewBeforeVerification = async (userId, verificationId, data) => {
  const { action, reason } = data;
  
  const manager = await prisma.managerProfile.findUnique({
    where: { userId }
  });
  if (!manager) throw createError(404, 'Manager profile not found');

  const verification = await prisma.beforeWorkVerification.findUnique({
    where: { id: verificationId },
    include: {
      assignment: {
        include: { issue: true }
      },
      worker: {
        include: { user: true }
      }
    }
  });

  if (!verification || verification.assignment.managerId !== manager.id) {
    throw createError(404, 'Verification not found or unauthorized access');
  }

  if (verification.status !== 'PENDING') {
    throw createError(409, `Verification is already ${verification.status}.`);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Check current status again to prevent race conditions
    const currentVerification = await tx.beforeWorkVerification.findUnique({
      where: { id: verificationId },
      select: { status: true }
    });
    
    if (currentVerification.status !== 'PENDING') {
      throw createError(409, 'Verification is no longer pending.');
    }

    let newStatus = 'PENDING';
    if (action === 'APPROVE') newStatus = 'APPROVED';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'REVISION_REQUESTED') newStatus = 'REVISION_REQUESTED';

    // 2. Update Verification
    const updatedVerification = await tx.beforeWorkVerification.update({
      where: { id: verificationId },
      data: { status: newStatus }
    });

    // 3. Handle APPROVE specifically
    if (action === 'APPROVE') {
      // Update WorkAssignment
      await tx.workAssignment.update({
        where: { id: verification.assignmentId },
        data: { status: 'IN_PROGRESS' }
      });
      
      // Update Issue
      await tx.issue.update({
        where: { id: verification.assignment.issueId },
        data: { status: 'WORK_STARTED' }
      });

      // Assignment Status History
      await tx.assignmentStatusHistory.create({
        data: {
          assignmentId: verification.assignmentId,
          oldStatus: 'ACCEPTED',
          newStatus: 'IN_PROGRESS',
          changedById: userId,
          reason: 'Before-work verification approved'
        }
      });

      // Issue Status History
      await tx.issueStatusHistory.create({
        data: {
          issueId: verification.assignment.issueId,
          oldStatus: 'ASSIGNED',
          newStatus: 'WORK_STARTED',
          changedById: userId,
          reason: 'Before-work verification approved'
        }
      });

      // Notification to Worker
      await tx.notification.create({
        data: {
          userId: verification.worker.user.id,
          type: 'INFO',
          title: 'Verification Approved',
          message: 'Before-work verification approved. You may begin the assigned work.',
          assignmentId: verification.assignmentId
        }
      });

    } else if (action === 'REJECT') {
      // Notification to Worker
      await tx.notification.create({
        data: {
          userId: verification.worker.user.id,
          type: 'INFO',
          title: 'Verification Rejected',
          message: `Before-work verification rejected. Reason: ${reason}`,
          assignmentId: verification.assignmentId
        }
      });
      
    } else if (action === 'REVISION_REQUESTED') {
      // Notification to Worker
      await tx.notification.create({
        data: {
          userId: verification.worker.user.id,
          type: 'INFO',
          title: 'Verification Revision Requested',
          message: `Before-work verification requires revision. Manager says: ${reason}`,
          assignmentId: verification.assignmentId
        }
      });
    }

    return updatedVerification;
  }, {
    maxWait: 15000,
    timeout: 20000
  });
};

const getAfterVerification = async (userId, assignmentId) => {
  const worker = await prisma.workerProfile.findUnique({
    where: { userId }
  });
  if (!worker) throw createError(404, 'Worker profile not found');

  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId, workerId: worker.id },
    include: { issue: true }
  });
  if (!assignment) throw createError(404, 'Assignment not found or does not belong to you');

  const verification = await prisma.afterWorkVerification.findUnique({
    where: { assignmentId },
    include: { media: true }
  });

  return {
    verification,
    issue: {
      id: assignment.issue.id,
      title: assignment.issue.title,
      latitude: assignment.issue.latitude,
      longitude: assignment.issue.longitude,
      address: assignment.issue.address,
      status: assignment.issue.status
    },
    assignment: {
      id: assignment.id,
      status: assignment.status
    }
  };
};

const submitAfterVerification = async (userId, assignmentId, data, files) => {
  const { latitude, longitude, workSummary, notes } = data;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId }
  });
  if (!worker) throw createError(404, 'Worker profile not found');

  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId, workerId: worker.id },
    include: { 
      issue: true,
      manager: {
        include: { user: true }
      }
    }
  });

  if (!assignment) throw createError(404, 'Assignment not found or does not belong to you');

  if (assignment.status !== 'COMPLETED') {
    throw createError(400, `Cannot verify. Assignment status is ${assignment.status}, expected COMPLETED`);
  }
  
  if (assignment.issue.status !== 'WORK_COMPLETED') {
    throw createError(400, `Cannot verify. Issue status is ${assignment.issue.status}, expected WORK_COMPLETED`);
  }
  
  if (!files || files.length === 0) {
    throw createError(400, 'At least one media file is required for after-work verification');
  }

  const existingVerification = await prisma.afterWorkVerification.findUnique({
    where: { assignmentId },
    include: { media: true }
  });

  if (existingVerification && (existingVerification.status === 'PENDING' || existingVerification.status === 'APPROVED')) {
    throw createError(409, 'After-work verification already submitted and is pending or approved');
  }

  // Pre-generate ID for Cloudinary folder structure
  const verificationId = existingVerification ? existingVerification.id : crypto.randomUUID();
  const mediaRecords = [];

  try {
    // Upload Media outside of the transaction to avoid timeout
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadToCloudinary(file, 'after-work', verificationId);
        mediaRecords.push({
          url: result.secure_url,
          type: result.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
          publicId: result.public_id,
        });
      }
    }

    // Database Transaction
    const verification = await prisma.$transaction(async (tx) => {
      let savedVerification;
      
      if (existingVerification) {
        // Reuse and update the existing verification record
        savedVerification = await tx.afterWorkVerification.update({
          where: { id: verificationId },
          data: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            workSummary,
            notes,
            status: 'PENDING',
            media: {
              create: mediaRecords
            }
          },
          include: {
            media: true
          }
        });
      } else {
        savedVerification = await tx.afterWorkVerification.create({
          data: {
            id: verificationId,
            assignmentId,
            workerId: worker.id,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            workSummary,
            notes,
            status: 'PENDING',
            media: {
              create: mediaRecords
            }
          },
          include: {
            media: true
          }
        });
      }

      if (assignment.manager && assignment.manager.user) {
        await tx.notification.create({
          data: {
            userId: assignment.manager.user.id,
            type: 'ASSIGNMENT',
            title: 'After-Work Verification Submitted',
            message: `Worker has submitted after-work verification for Issue #${assignment.issue.id.substring(0, 8)}`,
            assignmentId: assignment.id,
            issueId: assignment.issue.id
          }
        });
      }

      return savedVerification;
    }, {
      maxWait: 15000,
      timeout: 20000
    });

    return verification;
  } catch (error) {
    // Cleanup Cloudinary assets if anything failed
    for (const record of mediaRecords) {
      if (record.publicId) {
        await deleteFromCloudinary(record.publicId, record.type === 'VIDEO' ? 'video' : 'image');
      }
    }
    throw createError(500, 'Failed to submit verification: ' + error.message);
  }
};

const getManagerAfterVerifications = async (userId, filters) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId }
  });
  if (!manager) throw createError(404, 'Manager profile not found');

  const whereClause = {
    assignment: {
      managerId: manager.id
    },
    status: filters.status
  };

  if (filters.priority) {
    whereClause.assignment.issue = { ...whereClause.assignment.issue, priority: filters.priority };
  }
  
  if (filters.categoryId) {
    whereClause.assignment.issue = { ...whereClause.assignment.issue, categoryId: filters.categoryId };
  }

  const verifications = await prisma.afterWorkVerification.findMany({
    where: whereClause,
    include: {
      assignment: {
        include: {
          issue: {
            include: { category: true }
          }
        }
      },
      worker: {
        include: { user: true }
      },
      media: true
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  return verifications.map(v => {
    return {
      id: v.id,
      assignmentId: v.assignmentId,
      issueId: v.assignment.issue.id,
      issueTitle: v.assignment.issue.title,
      category: v.assignment.issue.category.name,
      priority: v.assignment.issue.priority,
      workerName: v.worker.user.name,
      workerId: v.worker.id,
      timestamp: v.timestamp,
      status: v.status,
      mediaCount: v.media.length
    };
  });
};

const getManagerAfterVerificationDetails = async (userId, verificationId) => {
  const manager = await prisma.managerProfile.findUnique({
    where: { userId }
  });
  if (!manager) throw createError(404, 'Manager profile not found');

  const verification = await prisma.afterWorkVerification.findUnique({
    where: { id: verificationId },
    include: {
      assignment: {
        include: {
          issue: {
            include: { category: true }
          },
          manager: {
            include: { user: true }
          },
          beforeVerification: {
            include: { media: true }
          },
          progressRecords: {
            include: { media: true },
            orderBy: { createdAt: 'asc' }
          }
        }
      },
      worker: {
        include: { 
          user: true,
          skills: true
        }
      },
      media: true
    }
  });

  if (!verification || verification.assignment.managerId !== manager.id) {
    throw createError(404, 'Verification not found or unauthorized access');
  }

  return {
    issue: {
      id: verification.assignment.issue.id,
      title: verification.assignment.issue.title,
      description: verification.assignment.issue.description,
      category: verification.assignment.issue.category.name,
      priority: verification.assignment.issue.priority,
      address: verification.assignment.issue.address,
      latitude: verification.assignment.issue.latitude,
      longitude: verification.assignment.issue.longitude,
      status: verification.assignment.issue.status
    },
    worker: {
      id: verification.worker.id,
      name: verification.worker.user.name,
      experienceYears: verification.worker.experienceYears,
      skills: verification.worker.skills
    },
    assignment: {
      id: verification.assignment.id,
      assignedRate: verification.assignment.assignedRate,
      assignedDate: verification.assignment.assignedDate,
      status: verification.assignment.status,
      manager: verification.assignment.manager.user.name,
      notes: verification.assignment.notes,
      beforeVerification: verification.assignment.beforeVerification,
      progressRecords: verification.assignment.progressRecords
    },
    verification: {
      id: verification.id,
      status: verification.status,
      latitude: verification.latitude,
      longitude: verification.longitude,
      workSummary: verification.workSummary,
      notes: verification.notes,
      timestamp: verification.timestamp,
      media: verification.media
    }
  };
};

const reviewAfterVerification = async (userId, verificationId, data) => {
  const { action, reason } = data;
  
  const manager = await prisma.managerProfile.findUnique({
    where: { userId }
  });
  if (!manager) throw createError(404, 'Manager profile not found');

  const verification = await prisma.afterWorkVerification.findUnique({
    where: { id: verificationId },
    include: {
      assignment: {
        include: { issue: true }
      },
      worker: {
        include: { user: true }
      }
    }
  });

  if (!verification || verification.assignment.managerId !== manager.id) {
    throw createError(404, 'Verification not found or unauthorized access');
  }

  if (verification.status !== 'PENDING') {
    throw createError(409, `Verification is already ${verification.status}.`);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Check current status again to prevent race conditions
    const currentVerification = await tx.afterWorkVerification.findUnique({
      where: { id: verificationId },
      select: { status: true }
    });
    
    if (currentVerification.status !== 'PENDING') {
      throw createError(409, 'Verification is no longer pending.');
    }

    let newStatus = 'PENDING';
    if (action === 'APPROVE') newStatus = 'APPROVED';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'REVISION_REQUESTED') newStatus = 'REVISION_REQUESTED';

    // 2. Update Verification
    const updatedVerification = await tx.afterWorkVerification.update({
      where: { id: verificationId },
      data: { status: newStatus }
    });

    // 3. Handle APPROVE specifically
    if (action === 'APPROVE') {
      // Update Issue
      await tx.issue.update({
        where: { id: verification.assignment.issueId },
        data: { status: 'RESOLVED' }
      });

      // Issue Status History
      await tx.issueStatusHistory.create({
        data: {
          issueId: verification.assignment.issueId,
          oldStatus: 'WORK_COMPLETED',
          newStatus: 'RESOLVED',
          changedById: userId,
          reason: 'After-work verification approved'
        }
      });

      // Notification to Worker
      await tx.notification.create({
        data: {
          userId: verification.worker.user.id,
          type: 'INFO',
          title: 'After-Work Verification Approved',
          message: 'After-work verification approved. The issue has been marked as RESOLVED.',
          assignmentId: verification.assignmentId
        }
      });

    } else if (action === 'REJECT') {
      // Notification to Worker
      await tx.notification.create({
        data: {
          userId: verification.worker.user.id,
          type: 'INFO',
          title: 'After-Work Verification Rejected',
          message: `After-work verification rejected. Reason: ${reason}`,
          assignmentId: verification.assignmentId
        }
      });
      
    } else if (action === 'REVISION_REQUESTED') {
      // Notification to Worker
      await tx.notification.create({
        data: {
          userId: verification.worker.user.id,
          type: 'INFO',
          title: 'After-Work Verification Revision Requested',
          message: `After-work verification requires revision. Manager says: ${reason}`,
          assignmentId: verification.assignmentId
        }
      });
    }

    return updatedVerification;
  }, {
    maxWait: 15000,
    timeout: 20000
  });
};

module.exports = {
  getBeforeVerification,
  submitBeforeVerification,
  getManagerBeforeVerifications,
  getManagerBeforeVerificationDetails,
  reviewBeforeVerification,
  getAfterVerification,
  submitAfterVerification,
  getManagerAfterVerifications,
  getManagerAfterVerificationDetails,
  reviewAfterVerification
};
