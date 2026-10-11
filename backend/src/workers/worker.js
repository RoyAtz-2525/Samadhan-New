require('dotenv').config();
const { isQueueConfigured } = require('../config/queue');
const { startMediaWorker, closeMediaWorker } = require('./mediaWorker');
const { startSlaWorker, closeSlaWorker } = require('./slaWorker');
const { closeAllQueues } = require('../queues');
const { connectDB } = require('../config/db');
const { reconcileOverdueIssues } = require('../services/slaService');

let isShuttingDown = false;
let reconcileInterval = null;
let isReconciling = false;
let isStarted = false;
let activeWorkers = { mediaWorker: null, slaWorker: null };

async function runReconciliation(source = 'periodic') {
  if (isReconciling || isShuttingDown) return;
  isReconciling = true;
  try {
    console.log(`[Worker Process] Running SLA overdue reconciliation (${source})...`);
    const summary = await reconcileOverdueIssues();
    console.log(`[Worker Process] Reconciliation (${source}) finished: ${summary.scannedCount} scanned, ${summary.overdueCount} overdue, ${summary.newlyNotifiedCount} newly notified.`);
    return summary;
  } catch (err) {
    console.warn(`[Worker Process] Reconciliation error (${source}):`, err.message);
    return null;
  } finally {
    isReconciling = false;
  }
}

async function startBackgroundWorkers() {
  if (isStarted) {
    console.log('[Worker Process] Background workers are already running.');
    return {
      status: 'already_running',
      hasRedis: isQueueConfigured(),
      activeWorkers: {
        mediaWorker: Boolean(activeWorkers.mediaWorker),
        slaWorker: Boolean(activeWorkers.slaWorker),
      },
    };
  }

  console.log('====================================================');
  console.log('  SAMADHAN Background Worker Subsystem Initializing');
  console.log('====================================================');

  // Always ensure database connection (idempotent in db.js)
  await connectDB();

  const hasRedis = isQueueConfigured();
  let mediaWorker = null;
  let slaWorker = null;

  if (hasRedis) {
    try {
      mediaWorker = startMediaWorker();
      slaWorker = startSlaWorker();
      activeWorkers = { mediaWorker, slaWorker };

      if (mediaWorker || slaWorker) {
        console.log('[Worker Process] Background queue workers initialized (Media & SLA).');
      } else {
        console.warn('[Worker Process] Queue workers could not connect to Redis; operating in database reconciliation mode.');
      }
    } catch (err) {
      console.error('[Worker Process] Error initializing queue workers:', err.message);
    }
  } else {
    console.warn('[Worker Process] REDIS_URL is not configured.');
    console.warn('[Worker Process] BullMQ queue workers are disabled.');
    console.log('[Worker Process] Operating in database-only reconciliation mode.');
  }

  // 1. Run automatic missed-job recovery immediately on startup
  try {
    await runReconciliation('startup');
  } catch (err) {
    console.warn('[Worker Process] Startup reconciliation warning:', err.message);
  }

  // 2. Set safe, bounded periodic reconciliation (every 15 minutes)
  if (!reconcileInterval) {
    reconcileInterval = setInterval(() => {
      runReconciliation('interval');
    }, 15 * 60 * 1000);
    reconcileInterval.unref?.();
  }

  isStarted = true;
  isShuttingDown = false;

  return {
    status: 'initialized',
    hasRedis,
    activeWorkers: {
      mediaWorker: Boolean(activeWorkers.mediaWorker),
      slaWorker: Boolean(activeWorkers.slaWorker),
    },
    reconciliationScheduled: true,
  };
}

async function stopBackgroundWorkers(signal = 'SHUTDOWN') {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Worker Process] Shutting down background workers (${signal})...`);

  if (reconcileInterval) {
    clearInterval(reconcileInterval);
    reconcileInterval = null;
  }

  try {
    await closeMediaWorker();
    await closeSlaWorker();
    await closeAllQueues();

    activeWorkers = { mediaWorker: null, slaWorker: null };
    isStarted = false;
    console.log('[Worker Process] Background workers stopped cleanly.');
  } catch (err) {
    console.error('[Worker Process] Error stopping background workers:', err.message);
  }
}

// Standalone CLI execution support (e.g. `npm run worker` or `node src/workers/worker.js`)
if (require.main === module) {
  startBackgroundWorkers().catch((err) => {
    console.error('[Worker Process] Fatal startup error:', err);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    await stopBackgroundWorkers('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await stopBackgroundWorkers('SIGTERM');
    process.exit(0);
  });
}

module.exports = {
  startBackgroundWorkers,
  stopBackgroundWorkers,
  runReconciliation,
  bootstrap: startBackgroundWorkers,
  shutdown: stopBackgroundWorkers,
};
