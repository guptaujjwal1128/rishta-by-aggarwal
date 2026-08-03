const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config");
const { findUserById } = require("../db/postgres");

function authenticate(required = true) {
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      if (!required) {
        return next();
      }
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const userId = payload.sub || payload.id;
      const user = userId ? await findUserById(userId) : null;
      if (!user) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
      req.user = user;
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired session" });
    }
  };
}

module.exports = {
  authenticate,
};
