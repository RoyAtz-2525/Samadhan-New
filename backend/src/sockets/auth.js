const { verifyAccessToken } = require('../utils/jwt');

function authenticateSocket(socket, next) {
  let token = null;

  // 1. Check auth payload sent by socket.io-client ({ auth: { token } })
  if (socket.handshake.auth && typeof socket.handshake.auth.token === 'string') {
    token = socket.handshake.auth.token.trim();
  }

  // 2. Check authorization header
  if (!token && socket.handshake.headers && socket.handshake.headers.authorization) {
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  // 3. Fallback: parse cookies, but ONLY accept accessToken (never refreshToken)
  if (!token && socket.handshake.headers && socket.handshake.headers.cookie) {
    const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {});
    if (cookies.accessToken) {
      token = cookies.accessToken;
    }
  }

  if (!token) {
    return next(new Error('Authentication error: No access token provided'));
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return next(new Error('Authentication error: Invalid token payload'));
    }

    // Attach verified user identity from JWT payload
    socket.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid or expired access token'));
  }
}

module.exports = { authenticateSocket };
