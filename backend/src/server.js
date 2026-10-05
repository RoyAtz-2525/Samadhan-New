require("dotenv").config();
const http = require("http");
const app = require("./app");

if (process.env.NODE_ENV === "production") {
  const requiredVariables = [
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    // RAZORPAY variables not required yet - payment not implemented
  ];
  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name],
  );
  const invalidSecrets = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"].filter(
    (name) =>
      process.env[name] &&
      (process.env[name].length < 32 ||
        /placeholder|replace[_-]?with|change[_-]?me|dummy|default|example|your[_-]?secret/i.test(
          process.env[name],
        )),
  );

  if (
    process.env.JWT_ACCESS_SECRET &&
    process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET
  ) {
    invalidSecrets.push(
      "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different",
    );
  }

  if (missingVariables.length || invalidSecrets.length) {
    throw new Error(
      `Invalid production environment configuration. Missing: ${missingVariables.join(", ") || "none"}. ` +
        `Invalid: ${invalidSecrets.join(", ") || "none"}.`,
    );
  }
}

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.IO can be initialized here with the configured frontend origin if needed.

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
