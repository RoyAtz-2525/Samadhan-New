var express = require("express");
var cors = require("cors");
var helmet = require("helmet");
var rateLimit = require("express-rate-limit");
var cookieParser = require("cookie-parser");

var authRoutes = require("./routes/authRoutes");
var issueRoutes = require("./routes/issueRoutes");
var adminRoutes = require("./routes/adminRoutes");
var managerRoutes = require("./routes/managerRoutes");
var workerRoutes = require("./routes/workerRoutes");
var verificationRoutes = require("./routes/verificationRoutes");
var superAdminRoutes = require("./routes/superAdminRoutes");
var paymentRoutes = require("./routes/paymentRoutes");

var errorHandler = require("./middleware/errorMiddleware").errorHandler;

var app = express();

var isProduction = process.env.NODE_ENV === "production";
var frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

/* Production environment validation */
if (isProduction) {
  var requiredVariables = [
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  var missingVariables = requiredVariables.filter(function (name) {
    return !process.env[name];
  });

  if (missingVariables.length > 0) {
    throw new Error(
      "Missing production environment variables: " +
        missingVariables.join(", "),
    );
  }

  if (
    process.env.JWT_ACCESS_SECRET.length < 32 ||
    process.env.JWT_REFRESH_SECRET.length < 32
  ) {
    throw new Error("JWT secrets must be at least 32 characters long.");
  }

  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT access and refresh secrets must be different.");
  }

  try {
    var frontendUrl = new URL(frontendOrigin);

    if (frontendUrl.protocol !== "https:") {
      throw new Error("HTTPS required");
    }
  } catch (error) {
    throw new Error("Production FRONTEND_URL must be a valid HTTPS URL.");
  }
}

/* Security */
app.use(helmet());

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

/* Body parsing */
app.use(
  express.json({
    verify: function (req, res, buf) {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* Health check */
app.get(["/health", "/api/health"], function (req, res) {
  res.status(200).json({
    status: "ok",
    message: "SAMADHAN API is running",
  });
});

/* API routes */
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api", paymentRoutes);

/* Error handler */
app.use(errorHandler);

module.exports = app;
