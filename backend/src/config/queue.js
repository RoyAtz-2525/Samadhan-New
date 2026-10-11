const Redis = require('ioredis');

let sharedConnection = null;
const workerConnections = [];

/**
 * Check if REDIS_URL is configured for BullMQ.
 * BullMQ requires a standard Redis TCP/TLS connection (e.g. redis:// or rediss://).
 * HTTP REST credentials cannot be used for BullMQ workers.
 *
 * @returns {boolean}
 */
function isQueueConfigured() {
  return Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim());
}

/**
 * Create or return an ioredis connection for BullMQ.
 * Separate from the caching client.
 *
 * @param {Object} options
 * @param {boolean} options.isWorker - Whether this connection is for a Worker (requires maxRetriesPerRequest: null)
 * @returns {Redis|null}
 */
function getQueueRedisConnection(options = {}) {
  const redisUrl = process.env.REDIS_URL ? process.env.REDIS_URL.trim() : null;
  if (!redisUrl) {
    return null;
  }

  const { isWorker = false } = options;

  // BullMQ workers require their own dedicated connection
  if (!isWorker && sharedConnection && sharedConnection.status !== 'end') {
    return sharedConnection;
  }

  const isTls = redisUrl.startsWith('rediss://');

  const connectionOptions = {
    maxRetriesPerRequest: null, // Required by BullMQ for workers and reliable queues
    enableReadyCheck: false,
    lazyConnect: true,
    tls: isTls ? { rejectUnauthorized: false } : undefined,
    retryStrategy: (times) => {
      // Continuously retry with capped exponential backoff up to 10s
      return Math.min(times * 1000, 10000);
    },
  };

  try {
    const conn = new Redis(redisUrl, connectionOptions);

    conn.on('connect', () => {
      console.log(`[BullMQ:Redis] Connection established (${isWorker ? 'Worker' : 'Queue'}).`);
    });

    conn.on('error', (err) => {
      console.warn(`[BullMQ:Redis] Connection warning (${isWorker ? 'Worker' : 'Queue'}): ${err.message}`);
    });

    conn.on('close', () => {
      console.log(`[BullMQ:Redis] Connection closed (${isWorker ? 'Worker' : 'Queue'}).`);
    });

    if (isWorker) {
      workerConnections.push(conn);
    } else {
      sharedConnection = conn;
    }

    return conn;
  } catch (err) {
    console.error('[BullMQ:Redis] Failed to initialize connection:', err.message);
    return null;
  }
}

/**
 * Close all active BullMQ Redis connections cleanly.
 */
async function closeQueueConnections() {
  const promises = [];

  if (sharedConnection) {
    promises.push(
      sharedConnection.quit().catch(() => {
        try { sharedConnection.disconnect(); } catch (_) {}
      })
    );
    sharedConnection = null;
  }

  while (workerConnections.length > 0) {
    const conn = workerConnections.pop();
    if (conn) {
      promises.push(
        conn.quit().catch(() => {
          try { conn.disconnect(); } catch (_) {}
        })
      );
    }
  }

  await Promise.all(promises);
}

module.exports = {
  isQueueConfigured,
  getQueueRedisConnection,
  closeQueueConnections,
};
