const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const { Storage } = require("@google-cloud/storage");

const {
  GCS_UPLOAD_BUCKET,
  GCS_UPLOAD_PREFIX,
  GCP_PROJECT_ID,
  UPLOAD_DIR,
} = require("../config");

const storage = GCS_UPLOAD_BUCKET
  ? new Storage({ projectId: GCP_PROJECT_ID || undefined })
  : null;

function safeExtension(originalName, fallback = ".jpg") {
  return path.extname(originalName || "").toLowerCase() || fallback;
}

function publicGcsUrl(objectName) {
  return `https://storage.googleapis.com/${GCS_UPLOAD_BUCKET}/${objectName}`;
}

function gcsObjectName(filename) {
  const prefix = GCS_UPLOAD_PREFIX.replace(/^\/+|\/+$/g, "");
  return prefix ? `${prefix}/${filename}` : filename;
}

async function uploadPhoto(file) {
  const ext = safeExtension(file.originalname);
  const filename = `${randomUUID()}${ext}`;

  if (GCS_UPLOAD_BUCKET) {
    const objectName = gcsObjectName(filename);
    const bucket = storage.bucket(GCS_UPLOAD_BUCKET);
    await bucket.file(objectName).save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    return {
      filename,
      url: publicGcsUrl(objectName),
      storageProvider: "gcs",
      storagePath: objectName,
    };
  }

  const photoDir = path.join(UPLOAD_DIR, "photos");
  await fs.mkdir(photoDir, { recursive: true });
  await fs.writeFile(path.join(photoDir, filename), file.buffer);

  return {
    filename,
    url: `/uploads/photos/${filename}`,
    storageProvider: "local",
    storagePath: path.join("photos", filename),
  };
}

module.exports = {
  uploadPhoto,
};
