const express = require("express");
const multer = require("multer");

const {
  adminStats,
  createNotification,
  createStandaloneProfile,
  getProfileById,
  listProfiles,
  listUsersWithProfiles,
  setProfileLock,
  setProfileVerification,
  updateProfileById,
  updateUserAdminSettings,
} = require("../db/postgres");
const { authenticate } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireAdmin");
const { extractProfileWithAi } = require("../services/aiProfileExtractor");
const { normalizeAnnualIncome, normalizeProfileInput } = require("../services/profileParser");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.use(authenticate());
router.use(requireAdmin);

function profilePayload(body) {
  const normalized = normalizeProfileInput(body);
  if (body.annualIncome !== undefined) {
    normalized.annualIncome = normalizeAnnualIncome(body.annualIncome);
  }
  return normalized;
}

function parseBulkJson(file, text) {
  const raw = text || file?.buffer?.toString("utf8") || "";
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

router.get("/stats", async (_req, res, next) => {
  try {
    res.json({ stats: await adminStats() });
  } catch (err) {
    next(err);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    res.json({ users: await listUsersWithProfiles() });
  } catch (err) {
    next(err);
  }
});

router.patch("/users/:id", async (req, res, next) => {
  try {
    const user = await updateUserAdminSettings(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/users/:id/notify", async (req, res, next) => {
  try {
    const title = String(req.body.title || "Complete your biodata");
    const message = String(
      req.body.message || "Please complete your profile details so we can show better matches.",
    );
    const channels = Array.isArray(req.body.channels) && req.body.channels.length
      ? req.body.channels
      : ["app"];
    const notifications = [];

    for (const channel of channels) {
      notifications.push(
        await createNotification({
          userId: req.params.id,
          channel,
          title,
          message,
          status: channel === "app" ? "delivered" : "queued",
        }),
      );
    }

    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

router.get("/profiles", async (req, res, next) => {
  try {
    res.json({ profiles: await listProfiles({ ...req.query, includeUnverified: true }) });
  } catch (err) {
    next(err);
  }
});

router.put("/profiles/:id", async (req, res, next) => {
  try {
    const profile = await updateProfileById(req.params.id, profilePayload(req.body));
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

router.patch("/profiles/:id/lock", async (req, res, next) => {
  try {
    const existing = await getProfileById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const profile = await setProfileLock(
      req.params.id,
      req.body.isLocked !== false,
      String(req.body.reason || ""),
    );
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

router.patch("/profiles/:id/verify", async (req, res, next) => {
  try {
    const existing = await getProfileById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const profile = await setProfileVerification(req.params.id, req.body.isVerified !== false);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

async function bulkDraftsFromRequest(req) {
  const drafts = [];
  const files = req.files || [];
  const firstFile = files[0];
  const fileName = firstFile?.originalname || "";
  const isJson = fileName.toLowerCase().endsWith(".json") || firstFile?.mimetype === "application/json";

  if (isJson || req.body.text?.trim()?.startsWith("[") || req.body.text?.trim()?.startsWith("{")) {
    const rows = parseBulkJson(firstFile, req.body.text);
    return {
      drafts: rows.map((row) => profilePayload(row)),
      aiUsed: false,
      sourceType: "json",
    };
  }

  if (files.length > 1) {
    for (const file of files) {
      const extracted = await extractProfileWithAi({ file });
      drafts.push(profilePayload(extracted.draft));
    }
    return { drafts, aiUsed: true, sourceType: "bulk-files" };
  }

  const extracted = await extractProfileWithAi({ file: firstFile, text: req.body.text });
  drafts.push(profilePayload(extracted.draft));
  return { drafts, aiUsed: extracted.aiUsed, sourceType: extracted.sourceType };
}

router.post("/profiles/bulk-preview", upload.array("source", 25), async (req, res, next) => {
  try {
    res.json(await bulkDraftsFromRequest(req));
  } catch (err) {
    next(err);
  }
});

router.post("/profiles/bulk-create", async (req, res, next) => {
  try {
    const created = [];
    const profiles = Array.isArray(req.body.profiles) ? req.body.profiles : [];
    if (!profiles.length) {
      return res.status(400).json({ message: "Provide at least one reviewed profile" });
    }
    for (const profile of profiles) {
      created.push(await createStandaloneProfile(profilePayload(profile)));
    }
    res.status(201).json({ created });
  } catch (err) {
    next(err);
  }
});

router.post("/profiles/bulk-upload", upload.array("source", 25), async (req, res, next) => {
  try {
    const { drafts, aiUsed, sourceType } = await bulkDraftsFromRequest(req);
    const created = [];
    for (const draft of drafts) {
      created.push(await createStandaloneProfile(draft));
    }
    return res.json({ created, aiUsed, sourceType });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
