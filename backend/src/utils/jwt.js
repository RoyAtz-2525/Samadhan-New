const jwt = require("jsonwebtoken");

const getSecret = (name) => {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`${name} is not configured.`);
  }
  return secret;
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role.name },
    getSecret("JWT_ACCESS_SECRET"),
    { expiresIn: "15m" },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role.name },
    getSecret("JWT_REFRESH_SECRET"),
    { expiresIn: "7d" },
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getSecret("JWT_ACCESS_SECRET"));
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getSecret("JWT_REFRESH_SECRET"));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
