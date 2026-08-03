const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(ROOT_DIR, ".env"), quiet: true });

module.exports = {
  PORT: Number(process.env.PORT) || 4000,
  JWT_SECRET: process.env.JWT_SECRET || "",
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || "",
  VERTEX_AI_LOCATION: process.env.VERTEX_AI_LOCATION || "",
  VERTEX_AI_IMAGE_PROCESSING_PRIMARY:
    process.env.VERTEX_AI_IMAGE_PROCESSING_PRIMARY || "",
  VERTEX_AI_IMAGE_PROCESSING_SECONDARY:
    process.env.VERTEX_AI_IMAGE_PROCESSING_SECONDARY || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATA_FILE: process.env.DATA_FILE || path.join(ROOT_DIR, "data", "db.json"),
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(ROOT_DIR, "uploads"),
  GCS_UPLOAD_BUCKET: process.env.GCS_UPLOAD_BUCKET || "",
  GCS_UPLOAD_PREFIX: process.env.GCS_UPLOAD_PREFIX || "photos",
};
