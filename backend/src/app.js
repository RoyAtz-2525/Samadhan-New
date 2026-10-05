const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const adminRoutes = require("./routes/adminRoutes");
const managerRoutes = require("./routes/managerRoutes");
const workerRoutes = require("./routes/workerRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const paymentRoutes = require("./routes/paymentRoutes");

const isProduction = process.env.NODE_ENV === "production";
const frontendOrigin = process.env.FRONTEND_URL;
let parsedFrontendOrigin;

try {
  parsedFrontendOrigin = frontendOrigin ? new URL(frontendOrigin) : null;
} catch {
  parsedFrontendOrigin = null;
}

if (
  frontendOrigin === "*" ||
  (isProduction &&
    (!parsedFrontendOrigin ||
      parsedFrontendOrigin.origin !== frontendOrigin ||
      parsedFrontendOrigin.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(
        parsedFrontendOrigin.hostname,
      )))
) {
  throw new Error(
    "Production FRONTEND_URL must be an exact HTTPS frontend origin; wildcard and local origins are not allowed.",
  );
}

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: frontendOrigin || "http://localhost:5173",
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic route to verify server is running
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "SAMADHAN API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api", paymentRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
