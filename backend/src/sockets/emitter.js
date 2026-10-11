const { getIO } = require('./index');

/**
 * Emits an event to a specific user's private room.
 * Safely handles environments where Socket.io is not initialized (e.g. Vercel serverless).
 */
function emitToUser(userId, eventName, payload) {
  if (!userId) return;
  const io = getIO();
  if (io) {
    io.to(`user_${userId}`).emit(eventName, payload);
  }
}

/**
 * Emits an event to a specific role's room.
 */
function emitToRole(role, eventName, payload) {
  if (!role) return;
  const io = getIO();
  if (io) {
    io.to(`role_${role}`).emit(eventName, payload);
  }
}

module.exports = { emitToUser, emitToRole };
