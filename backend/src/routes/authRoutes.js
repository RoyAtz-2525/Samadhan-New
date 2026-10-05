const express = require("express");
const router = express.Router();

const {
  registerCitizen,
  registerWorker,
  login,
  refresh,
  logout,
  getMe,
} = require("../controllers/authController");

const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidators");
const { requireAuth } = require("../middleware/authMiddleware");

const requireFrontendOrigin = (req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.get("origin") !== process.env.FRONTEND_URL
  ) {
    return res.status(403).json({ error: "Request origin is not allowed" });
  }
  return next();
};

router.post("/register/citizen", validateRegister, registerCitizen);
router.post("/register/worker", validateRegister, registerWorker);
router.post("/login", validateLogin, login);
router.post("/refresh", requireFrontendOrigin, refresh);
router.post("/logout", requireFrontendOrigin, logout);
router.get("/me", requireAuth, getMe);

module.exports = router;
