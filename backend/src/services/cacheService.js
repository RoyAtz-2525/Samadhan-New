const { getRedisClient, isRedisReady } = require('../config/redis');

const CACHE_KEYS = {
  PUBLIC_MAP: 'samadhan:cache:public_map',
  CATEGORIES: 'samadhan:cache:categories',
  ADMIN_METRICS: 'samadhan:cache:admin_metrics',
  SUPERADMIN_OVERVIEW: 'samadhan:cache:superadmin_overview',
  SUPERADMIN_ANALYTICS: (range) => `samadhan:cache:superadmin_analytics:${range || '30d'}`,
};

/**
 * Retrieves and deserializes a cached value.
 * Returns null on cache miss, malformed data, or if Redis is unavailable.
 */
async function get(key) {
  if (!isRedisReady()) return null;
  try {
    const client = getRedisClient();
    if (!client) return null;
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Cache] GET error for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Serializes and stores a value in Redis with a TTL in seconds.
 * Fails gracefully without throwing on Redis errors.
 */
async function set(key, value, ttlSeconds = 300) {
  if (!isRedisReady()) return false;
  try {
    const client = getRedisClient();
    if (!client) return false;
    const payload = JSON.stringify(value);
    await client.set(key, payload, { EX: ttlSeconds });
    return true;
  } catch (err) {
    console.warn(`[Cache] SET error for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Deletes a single cache key.
 */
async function del(key) {
  if (!isRedisReady()) return false;
  try {
    const client = getRedisClient();
    if (!client) return false;
    await client.del(key);
    return true;
  } catch (err) {
    console.warn(`[Cache] DEL error for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Safely deletes keys matching a prefix using SCAN to avoid blocking Redis.
 */
async function deleteByPrefix(prefix) {
  if (!isRedisReady()) return false;
  try {
    const client = getRedisClient();
    if (!client) return false;
    const keysToDelete = [];
    for await (const k of client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
      keysToDelete.push(k);
    }
    if (keysToDelete.length > 0) {
      await client.del(keysToDelete);
    }
    return true;
  } catch (err) {
    console.warn(`[Cache] DELETE_BY_PREFIX error for "${prefix}":`, err.message);
    return false;
  }
}

/**
 * Helper to invalidate all public issue and aggregate dashboard caches
 * when issues, assignments, or statuses change.
 */
async function invalidateIssueCaches() {
  try {
    await Promise.allSettled([
      del(CACHE_KEYS.PUBLIC_MAP),
      del(CACHE_KEYS.ADMIN_METRICS),
      del(CACHE_KEYS.SUPERADMIN_OVERVIEW),
      deleteByPrefix('samadhan:cache:superadmin_analytics'),
    ]);
  } catch (err) {
    console.warn('[Cache] Invalidation warning:', err.message);
  }
}

module.exports = {
  CACHE_KEYS,
  get,
  set,
  del,
  deleteByPrefix,
  invalidateIssueCaches,
};
