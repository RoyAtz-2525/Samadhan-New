const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  console.error("Request failed", {
    name: err.name || "Error",
    status,
    method: req.method,
  });
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
};

module.exports = {
  errorHandler,
};
