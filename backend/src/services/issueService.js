const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const streamifier = require("streamifier");

const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryHelper");

const getCategories = async () => {
  return await prisma.issueCategory.findMany();
};

const createIssue = async (userId, data, files) => {
  const { categoryId, title, description, latitude, longitude, address } = data;

  // Find citizen profile
  const citizen = await prisma.citizenProfile.findUnique({
    where: { userId },
  });

  if (!citizen) {
    const error = new Error("Citizen profile not found");
    error.statusCode = 404;
    throw error;
  }

  // Validate category
  const category = await prisma.issueCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    const error = new Error("Invalid issue category");
    error.statusCode = 400;
    throw error;
  }

  const crypto = require("crypto");
  const issueId = crypto.randomUUID();
  let uploadedAssets = [];

  try {
    // 1. Upload media outside transaction to prevent transaction timeout
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadToCloudinary(file, "issues", issueId);
        uploadedAssets.push({
          publicId: result.public_id,
          resourceType: result.resource_type,
          url: result.secure_url,
          type: file.mimetype.startsWith("video/") ? "VIDEO" : "IMAGE",
          metadata: {
            format: result.format,
            bytes: result.bytes,
            originalName: file.originalname,
          },
        });
      }
    }

    // Use a transaction
    return await prisma.$transaction(
      async (tx) => {
        // 2. Create the issue
        const issue = await tx.issue.create({
          data: {
            id: issueId,
            reporterId: citizen.id,
            categoryId: category.id,
            title,
            description,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            address,
            status: "REPORTED",
            priority: "MEDIUM", // Default priority, admin can change
          },
        });

        // 3. Create the initial IssueStatusHistory
        await tx.issueStatusHistory.create({
          data: {
            issueId: issue.id,
            oldStatus: "REPORTED",
            newStatus: "REPORTED",
            changedById: userId, // The citizen created this
            reason: "Issue initially reported by citizen",
          },
        });

        // 4. Save media records if any
        if (uploadedAssets.length > 0) {
          for (const asset of uploadedAssets) {
            await tx.issueMedia.create({
              data: {
                issueId: issue.id,
                url: asset.url,
                publicId: asset.publicId,
                type: asset.type,
                metadata: asset.metadata,
              },
            });
          }
        }

        return await tx.issue.findUnique({
          where: { id: issue.id },
          include: {
            category: true,
            media: true,
          },
        });
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  } catch (error) {
    // Transaction failed or upload failed, cleanup any uploaded Cloudinary assets
    for (const asset of uploadedAssets) {
      if (asset.publicId) {
        await deleteFromCloudinary(asset.publicId, asset.resourceType);
      }
    }
    throw error;
  }
};

const getCitizenIssues = async (userId, filters = {}) => {
  const citizen = await prisma.citizenProfile.findUnique({
    where: { userId },
  });

  if (!citizen) {
    const error = new Error("Citizen profile not found");
    error.statusCode = 404;
    throw error;
  }

  const query = {
    where: {
      reporterId: citizen.id,
    },
    include: {
      category: true,
      media: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  if (filters.status && filters.status !== "ALL") {
    query.where.status = filters.status;
  }

  return await prisma.issue.findMany(query);
};

const getCitizenIssueDetails = async (userId, issueId) => {
  const citizen = await prisma.citizenProfile.findUnique({
    where: { userId },
  });

  if (!citizen) {
    const error = new Error("Citizen profile not found");
    error.statusCode = 404;
    throw error;
  }

  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      reporterId: citizen.id, // Ensure they can only view their own
    },
    include: {
      category: true,
      media: true,
      statusHistory: {
        orderBy: {
          timestamp: "desc",
        },
        include: {
          changedBy: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!issue) {
    const error = new Error("Issue not found or unauthorized access");
    error.statusCode = 404;
    throw error;
  }

  return issue;
};

const submitReview = async (userId, issueId, data) => {
  const { rating, comment } = data;
  const ratingInt = parseInt(rating);

  if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    const error = new Error("Rating must be between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  const citizen = await prisma.citizenProfile.findUnique({ where: { userId } });
  if (!citizen) {
    const error = new Error("Citizen profile not found");
    error.statusCode = 404;
    throw error;
  }

  // Find issue and verify ownership
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, reporterId: citizen.id },
  });

  if (!issue) {
    const error = new Error("Issue not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  if (issue.status !== "RESOLVED") {
    const error = new Error("Review can only be submitted for RESOLVED issues");
    error.statusCode = 400;
    throw error;
  }

  // Find the completed assignment for this issue to get the worker
  const assignment = await prisma.workAssignment.findFirst({
    where: { issueId: issue.id, status: "COMPLETED" },
    include: { worker: true },
  });

  if (!assignment) {
    const error = new Error("No completed assignment found for this issue");
    error.statusCode = 400;
    throw error;
  }

  // Check for duplicate
  const existingReview = await prisma.review.findUnique({
    where: { issueId: issue.id },
  });

  if (existingReview) {
    const error = new Error("Worker review already submitted for this issue");
    error.statusCode = 409;
    throw error;
  }

  const review = await prisma.review.create({
    data: {
      issueId: issue.id,
      reviewerId: citizen.id,
      revieweeId: assignment.workerId,
      rating: ratingInt,
      comment: comment ? String(comment).trim() : null,
    },
  });

  // Notify Worker
  await prisma.notification.create({
    data: {
      userId: assignment.worker.userId,
      type: "INFO",
      title: "New Review Received",
      message: `You received a ${ratingInt}-star review for civic issue: ${issue.title}`,
      issueId: issue.id,
      assignmentId: assignment.id,
    },
  });

  return review;
};

const getReview = async (userId, issueId) => {
  const citizen = await prisma.citizenProfile.findUnique({ where: { userId } });
  if (!citizen) {
    const error = new Error("Citizen profile not found");
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, reporterId: citizen.id },
  });

  if (!issue) {
    const error = new Error("Issue not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  const review = await prisma.review.findUnique({
    where: { issueId: issue.id },
  });

  return review || null;
};

const submitFeedback = async (userId, issueId, data) => {
  const { rating, comment } = data;
  const ratingInt = parseInt(rating);

  if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    const error = new Error("Rating must be between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  const citizen = await prisma.citizenProfile.findUnique({ where: { userId } });
  if (!citizen) {
    const error = new Error("Citizen profile not found");
    error.statusCode = 404;
    throw error;
  }

  const issue = await prisma.issue.findFirst({
    where: { id: issueId, reporterId: citizen.id },
  });

  if (!issue) {
    const error = new Error("Issue not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  if (issue.status !== "RESOLVED") {
    const error = new Error(
      "Feedback can only be submitted for RESOLVED issues",
    );
    error.statusCode = 400;
    throw error;
  }

  const existingFeedback = await prisma.feedback.findUnique({
    where: { issueId: issue.id },
  });

  if (existingFeedback) {
    const error = new Error("Feedback already submitted for this issue");
    error.statusCode = 409;
    throw error;
  }

  const feedback = await prisma.feedback.create({
    data: {
      issueId: issue.id,
      citizenId: citizen.id,
      rating: ratingInt,
      comment: comment ? String(comment).trim() : null,
    },
  });

  return feedback;
};

const getFeedback = async (userId, issueId) => {
  const citizen = await prisma.citizenProfile.findUnique({ where: { userId } });
  if (!citizen) {
    const error = new Error("Citizen profile not found");
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, reporterId: citizen.id },
  });

  if (!issue) {
    const error = new Error("Issue not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  const feedback = await prisma.feedback.findUnique({
    where: { issueId: issue.id },
  });

  return feedback || null;
};

module.exports = {
  getCategories,
  createIssue,
  getCitizenIssues,
  getCitizenIssueDetails,
  submitReview,
  getReview,
  submitFeedback,
  getFeedback,
};
