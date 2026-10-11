const { Server } = require('socket.io');
const { authenticateSocket } = require('./auth');

let io = null;

const VALID_ROLES = ['CITIZEN', 'ADMIN', 'MANAGER', 'WORKER', 'SUPER_ADMIN'];

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user?.userId;
    const role = socket.user?.role;

    // Join private room only for the authenticated user ID
    if (userId) {
      socket.join(`user_${userId}`);
    }

    // Join role room only if role is verified against valid platform roles
    if (role && VALID_ROLES.includes(role)) {
      socket.join(`role_${role}`);
    }

    // Arbitrary client room joins are strictly not permitted

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    console.warn('Socket.io has not been initialized. Ensure you are running on a persistent server.');
  }
  return io;
}

module.exports = { initSocket, getIO };
