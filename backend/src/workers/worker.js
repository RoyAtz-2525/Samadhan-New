require('dotenv').config();
const { isQueueConfigured } = require('../config/queue');
const { startMediaWorker, closeMediaWorker } = require('./mediaWorker');
const { startSlaWorker, closeSlaWorker } = require('./slaWorker');
const { closeAllQueues } = require('../queues');
const { connectDB } = require('../config/db');
const { reconcileOverdueIssues } = require('../services/slaService');

console.log('====================================================');
console.log('  SAMADHAN Background Worker Process Starting');
console.log('====================================================');

let isShuttingDown = false;
let reconcileInterval = null;
let isReconciling = false;

async function runReconciliation(source = 'periodic') {
  if (isReconciling || isShuttingDown) return;
  isReconciling = true;
  try {
    console.log(`[Worker Process] Running SLA overdue reconciliation (${source})...`);
    const summary = await reconcileOverdueIssues();
    console.log(`[Worker Process] Reconciliation (${source}) finished: ${summary.scannedCount} scanned, ${summary.overdueCount} overdue, ${summary.newlyNotifiedCount} newly notified.`);
  } catch (err) {
    console.warn(`[Worker Process] Reconciliation error (${source}):`, err.message);
  } finally {
    isReconciling = false;
  }
}

async function bootstrap() {
  // Always connect to PostgreSQL database (source of truth)
  await connectDB();

  const hasRedis = isQueueConfigured();

  if (hasRedis) {
    // Start BullMQ workers if Redis is configured
    const mediaWorker = startMediaWorker();
    const slaWorker = startSlaWorker();

    if (mediaWorker || slaWorker) {
      console.log('[Worker Process] Background queue workers initialized (Media & SLA).');
    } else {
      console.warn('[Worker Process] Queue workers could not connect to Redis; falling back to database reconciliation.');
    }
  } else {
    console.warn('[Worker Process] REDIS_URL is not configured.');
    console.warn('[Worker Process] BullMQ queue workers are disabled.');
    console.log('[Worker Process] Running in database-only reconciliation mode.');
  }

  // 1. Run automatic missed-job recovery immediately on worker boot
  await runReconciliation('startup');

  // 2. Set safe, bounded periodic reconciliation (every 15 minutes)
  reconcileInterval = setInterval(() => {
    runReconciliation('interval');
  }, 15 * 60 * 1000);
}

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Worker Process] Received ${signal}. Starting graceful shutdown...`);

  if (reconcileInterval) {
    clearInterval(reconcileInterval);
    reconcileInterval = null;
  }

  try {
    await closeMediaWorker();
    await closeSlaWorker();
    await closeAllQueues();

    console.log('[Worker Process] Graceful shutdown complete. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('[Worker Process] Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap().catch((err) => {
  console.error('[Worker Process] Fatal startup error:', err);
  process.exit(1);
});
