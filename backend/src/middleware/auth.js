const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config");

function authenticate(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      if (!required) {
        return next();
      }
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      req.user = jwt.verify(token, JWT_SECRET);
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired session" });
    }
  };
}

module.exports = {
  authenticate,
};
