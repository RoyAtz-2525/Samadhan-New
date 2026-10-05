const authService = require("../services/authService");
const { verifyRefreshToken, generateAccessToken } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const registerCitizen = async (req, res, next) => {
  try {
    const user = await authService.registerCitizen(req.body);
    res
      .status(201)
      .json({ message: "Citizen registered successfully", userId: user.id });
  } catch (error) {
    next(error);
  }
};

const registerWorker = async (req, res, next) => {
  try {
    const user = await authService.registerWorker(req.body);
    res
      .status(201)
      .json({ message: "Worker registered successfully", userId: user.id });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { safeUser, accessToken, refreshToken } = await authService.login(
      req.body,
    );

    res.cookie("refreshToken", refreshToken, {
      ...refreshCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ user: safeUser, accessToken });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token not found" });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res
        .status(401)
        .json({ error: "Invalid user or inactive account" });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token validation failed:", error.name);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      ...refreshCookieOptions,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCitizen,
  registerWorker,
  login,
  refresh,
  logout,
  getMe,
};
