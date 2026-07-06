const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(ROOT_DIR, ".env"), quiet: true });

module.exports = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: process.env.JWT_SECRET || "dev-rishta-secret-change-me",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  ADMIN_NAME: process.env.ADMIN_NAME || "Rishta Admin",
  ADMIN_PHONE: process.env.ADMIN_PHONE || "",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgres://rishta:rishta@127.0.0.1:5433/rishta_dev",
  DATA_FILE: process.env.DATA_FILE || path.join(ROOT_DIR, "data", "db.json"),
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(ROOT_DIR, "uploads"),
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || "",
  GCS_UPLOAD_BUCKET: process.env.GCS_UPLOAD_BUCKET || "",
  GCS_PUBLIC_BASE_URL: process.env.GCS_PUBLIC_BASE_URL || "",
};
