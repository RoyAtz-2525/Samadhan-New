/**
 * Redis client configuration for application caching (cacheService.js).
 * Supports:
 * 1. Upstash Redis REST API (via UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) - Recommended for Serverless & APIs.
 * 2. Standard Redis TCP connection (via REDIS_URL with node-redis).
 * 3. Graceful fallback to database-direct mode when Redis is unconfigured or unavailable.
 */

const { createClient } = require('redis');

let activeClient = null;
let clientType = 'none'; // 'upstash_rest' | 'node_redis' | 'none'
let isConnected = false;
let connectionFailed = false;

/**
 * Lightweight, zero-dependency Upstash REST Client adapter.
 * Matches node-redis interface used by cacheService.js:
 * - ping()
 * - get(key)
 * - set(key, value, { EX: seconds })
 * - del(keyOrKeys)
 * - scanIterator({ MATCH, COUNT })
 */
class UpstashRestClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  async executeCommand(commandArray) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commandArray),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Upstash REST command failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.result;
  }

  async ping() {
    return await this.executeCommand(['PING']);
  }

  async get(key) {
    return await this.executeCommand(['GET', key]);
  }

  async set(key, value, options = {}) {
    const cmd = ['SET', key, value];
    if (options.EX) {
      cmd.push('EX', options.EX);
    } else if (options.PX) {
      cmd.push('PX', options.PX);
    }
    return await this.executeCommand(cmd);
  }

  async del(keyOrKeys) {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    if (keys.length === 0) return 0;
    return await this.executeCommand(['DEL', ...keys]);
  }

  async* scanIterator(options = {}) {
    const match = options.MATCH || '*';
    const count = options.COUNT || 100;
    let cursor = '0';

    do {
      const res = await this.executeCommand(['SCAN', cursor, 'MATCH', match, 'COUNT', count]);
      cursor = res[0];
      const keys = res[1] || [];
      for (const k of keys) {
        yield k;
      }
    } while (cursor !== '0');
  }

  async quit() {
    return 'OK';
  }

  async disconnect() {
    return 'OK';
  }
}

function getRedisClient() {
  return isConnected ? activeClient : null;
}

function isRedisReady() {
  return isConnected && activeClient !== null;
}

function getClientType() {
  return clientType;
}

/**
 * Connect to Redis caching provider.
 * Prefers Upstash REST when credentials are provided; falls back to REDIS_URL,
 * or operates gracefully in database-direct mode without throwing.
 */
async function connectRedis() {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const tcpUrl = process.env.REDIS_URL?.trim();

  // Mode 1: Upstash Redis REST
  if (restUrl && restToken) {
    try {
      const client = new UpstashRestClient(restUrl, restToken);
      const pingRes = await client.ping();
      if (pingRes === 'PONG') {
        console.log('[Redis:UpstashREST] Connected and ready via HTTP REST API.');
        activeClient = client;
        clientType = 'upstash_rest';
        isConnected = true;
        connectionFailed = false;
        return activeClient;
      }
    } catch (err) {
      console.warn('[Redis:UpstashREST] Connection verification failed:', err.message);
      connectionFailed = true;
      isConnected = false;
      return null;
    }
  }

  // Mode 2: Standard TCP node-redis
  if (tcpUrl) {
    if (connectionFailed) {
      return null;
    }

    try {
      const isTls = tcpUrl.startsWith('rediss://');
      const client = createClient({
        url: tcpUrl,
        socket: {
          tls: isTls,
          rejectUnauthorized: false,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.warn('[Redis:TCP] Max reconnection attempts reached. Continuing in database-direct mode.');
              connectionFailed = true;
              isConnected = false;
              return false;
            }
            return Math.min(retries * 500, 2000);
          },
          connectTimeout: 5000,
        },
      });

      client.on('ready', () => {
        console.log('[Redis:TCP] Connected and ready via Redis TCP protocol.');
        isConnected = true;
        connectionFailed = false;
      });

      client.on('error', (err) => {
        console.warn('[Redis:TCP] Client error:', err.message);
        isConnected = false;
      });

      client.on('end', () => {
        console.log('[Redis:TCP] Connection closed');
        isConnected = false;
      });

      await client.connect();
      activeClient = client;
      clientType = 'node_redis';
      return activeClient;
    } catch (err) {
      console.warn('[Redis:TCP] Initial connection failed:', err.message);
      connectionFailed = true;
      isConnected = false;
      return null;
    }
  }

  // Mode 3: No Redis credentials configured
  console.log('[Redis] No Redis credentials configured. Operating in database-direct mode (caching disabled).');
  clientType = 'none';
  isConnected = false;
  return null;
}

/**
 * Gracefully close active caching client.
 */
async function closeRedis() {
  if (activeClient) {
    try {
      await activeClient.quit();
    } catch (_) {
      try { await activeClient.disconnect(); } catch (__) {}
    }
    activeClient = null;
    clientType = 'none';
    isConnected = false;
  }
}

module.exports = {
  getRedisClient,
  isRedisReady,
  getClientType,
  connectRedis,
  closeRedis,
  UpstashRestClient,
};
