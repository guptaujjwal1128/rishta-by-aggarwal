const express = require("express");

const { listNotificationsForUser } = require("../db/postgres");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate());

router.get("/", async (req, res, next) => {
  try {
    const notifications = await listNotificationsForUser(req.user.id);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
