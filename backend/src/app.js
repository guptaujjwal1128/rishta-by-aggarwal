const cors = require("cors");
const express = require("express");
const fs = require("fs");
const path = require("path");

const { UPLOAD_DIR } = require("./config");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications");
const profileRoutes = require("./routes/profiles");

const app = express();

fs.mkdirSync(path.join(UPLOAD_DIR, "photos"), { recursive: true });

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(UPLOAD_DIR)));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "rishta-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profiles", profileRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    message: err.message || "Something went wrong",
  });
});

module.exports = app;
