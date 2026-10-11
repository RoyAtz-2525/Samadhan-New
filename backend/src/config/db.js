const cacheService = require('../services/cacheService');
const { PrismaClient } = require("@prisma/client");
const { AsyncLocalStorage } = require('async_hooks');

// Ensure sufficient connection timeout for serverless Neon database cold starts
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connect_timeout=')) {
  const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}connect_timeout=15`;
}

const notificationStorage = new AsyncLocalStorage();
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

function emitNotificationEvent(notification) {
  if (!notification || !notification.userId) return;
  try {
    const { emitToUser } = require('../sockets/emitter');
    emitToUser(notification.userId, 'notification:new', notification);
    
    if (notification.type === 'ASSIGNMENT' && notification.assignmentId) {
      emitToUser(notification.userId, 'assignment:updated', { assignmentId: notification.assignmentId });
    } else if (notification.issueId) {
      emitToUser(notification.userId, 'issue:updated', { issueId: notification.issueId });
    } else if (notification.appraisalId) {
      emitToUser(notification.userId, 'appraisal:updated', { appraisalId: notification.appraisalId });
    }
  } catch (err) {
    console.error('Failed to emit notification event:', err.message);
  }
}

// Prisma extension to hook into Notification.create
const prisma = basePrisma.$extends({
  query: {
    notification: {
      async create({ args, query }) {
        const result = await query(args);
        
        const store = notificationStorage.getStore();
        if (store) {
          // Inside a transaction, queue it until successful commit
          store.push(result);
        } else {
          // Outside a transaction, emit immediately
          emitNotificationEvent(result);
          if (result.issueId) { cacheService.invalidateIssueCaches().catch(() => {}); }
        }
        return result;
      }
    }
  }
});

// Preserve original $transaction implementation safely bound to the extended client
const originalTransaction = prisma.$transaction.bind(prisma);

// Wrap $transaction to provide transactional post-commit notification guarantees
prisma.$transaction = async function(...args) {
  // If not an interactive transaction callback, delegate directly
  if (typeof args[0] !== 'function') {
    return await originalTransaction(...args);
  }

  const [fn, options] = args;
  const store = [];

  return await notificationStorage.run(store, async () => {
    const result = await originalTransaction(async (tx) => {
      return await fn(tx);
    }, options);

    // Reaching here means the transaction successfully committed!
    let hasIssueNotification = false;
    for (const notif of store) {
      if (notif.issueId) hasIssueNotification = true;
      emitNotificationEvent(notif);
    }
    if (hasIssueNotification) { cacheService.invalidateIssueCaches().catch(() => {}); }

    return result;
  });
};

const connectDB = async (retries = 3, delayMs = 1500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await basePrisma.$connect();
      console.log("Database connected successfully");
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      } else {
        throw error;
      }
    }
  }
};

module.exports = {
  prisma,
  basePrisma,
  connectDB,
};
