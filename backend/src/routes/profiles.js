const express = require("express");
const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

const { UPLOAD_DIR } = require("../config");
const {
  addProfilePhotos,
  findUserById,
  getProfileById,
  getProfileByUserId,
  listProfiles,
  upsertUserProfile,
} = require("../db/postgres");
const { authenticate } = require("../middleware/auth");
const { extractProfileWithAi } = require("../services/aiProfileExtractor");
const {
  normalizeAnnualIncome,
  normalizeProfileInput,
  parseUploadedBiodata,
} = require("../services/profileParser");
const { createBiodataPdf } = require("../services/pdfService");

const router = express.Router();

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: path.join(UPLOAD_DIR, "photos"),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 4 * 1024 * 1024, files: 5 },
});

router.use(authenticate());

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function serializeProfile(profile) {
  const age = calculateAge(profile.dateOfBirth);
  return {
    ...profile,
    age,
    photoUrls: (profile.photos || []).map((photo) => photo.url),
  };
}

function canEditProfile(user, profile) {
  return user.role === "admin" || profile.userId === user.id;
}

function profilePayload(body) {
  const normalized = normalizeProfileInput(body);

  if (body.annualIncome !== undefined) {
    normalized.annualIncome = normalizeAnnualIncome(body.annualIncome);
  }

  return normalized;
}

router.get("/", async (req, res, next) => {
  try {
    const profiles = (await listProfiles(req.query)).map(serializeProfile);

    res.json({ profiles });
  } catch (err) {
    next(err);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);
    res.json({ profile: profile ? serializeProfile(profile) : null });
  } catch (err) {
    next(err);
  }
});

router.put("/me", async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    const existing = await getProfileByUserId(req.user.id);
    if (user?.canEditBio === false || existing?.isLocked) {
      return res.status(403).json({ message: "Your biodata is locked by admin" });
    }

    const payload = profilePayload(req.body);
    const savedProfile = await upsertUserProfile(req.user.id, payload);

    res.json({ profile: serializeProfile(savedProfile) });
  } catch (err) {
    next(err);
  }
});

router.post("/import", importUpload.single("biodata"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Upload a .json, .txt, or .csv biodata file" });
    }
    const draft = parseUploadedBiodata(req.file);
    res.json({ draft });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/import-ai",
  importUpload.array("source", 10),
  async (req, res, next) => {
    try {
      const result = await extractProfileWithAi({
        files: req.files || [],
        text: req.body.text,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/:id", async (req, res, next) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json({ profile: serializeProfile(profile) });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/photos", photoUpload.array("photos", 5), async (req, res, next) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    if (!canEditProfile(req.user, profile)) {
      return res.status(403).json({ message: "You can upload photos only for your own profile" });
    }
    if (req.user.role !== "admin" && profile.isLocked) {
      return res.status(403).json({ message: "This biodata is locked by admin" });
    }

    const uploaded = (req.files || []).map((file) => ({
      id: randomUUID(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      url: `/uploads/photos/${file.filename}`,
      uploadedAt: new Date().toISOString(),
    }));

    const savedProfile = await addProfilePhotos(req.params.id, uploaded);

    res.json({ profile: serializeProfile(savedProfile) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/biodata.pdf", async (req, res, next) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    createBiodataPdf(profile, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
