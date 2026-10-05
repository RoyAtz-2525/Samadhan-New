const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User role not found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: Insufficient role permissions" });
    }

    next();
  };
};

const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res
          .status(401)
          .json({ error: "Unauthorized: User role not found" });
      }

      // We need to fetch the role and its permissions from DB
      // Note: In a production app, we might cache this in Redis or put it in the JWT
      const role = await prisma.role.findUnique({
        where: { name: req.user.role },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        return res.status(403).json({ error: "Forbidden: Role not found" });
      }

      const hasPermission = role.permissions.some(
        (rp) => rp.permission.name === requiredPermission,
      );

      if (!hasPermission) {
        return res
          .status(403)
          .json({ error: "Forbidden: Missing required permission" });
      }

      next();
    } catch (error) {
      console.error("Permission check failed:", error.name || "Error");
      res
        .status(500)
        .json({ error: "Internal server error during permission check" });
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
};
