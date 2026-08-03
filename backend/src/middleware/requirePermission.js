const { hasPermission } = require("../auth/permissions");

function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    return next();
  };
}

module.exports = {
  requirePermission,
};
