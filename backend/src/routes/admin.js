const express = require("express");
const multer = require("multer");

const {
  adminStats,
  createAdminAuditLog,
  createNotification,
  createStandaloneProfile,
  findUserById,
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
const { requirePermission } = require("../middleware/requirePermission");
const { Permissions, normalizePermissions } = require("../auth/permissions");
const { extractProfileWithAi } = require("../services/aiProfileExtractor");
const {
  normalizeAnnualIncome,
  normalizeProfileInput,
} = require("../services/profileParser");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

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

router.get(
  "/stats",
  requirePermission(Permissions.ADMIN_DASHBOARD_VIEW),
  async (_req, res, next) => {
    try {
      res.json({ stats: await adminStats() });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/users",
  requirePermission(Permissions.USERS_READ),
  async (_req, res, next) => {
    try {
      res.json({ users: await listUsersWithProfiles() });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/users/:id",
  requirePermission(Permissions.USERS_MANAGE_ACCESS),
  async (req, res, next) => {
    try {
      const before = await findUserById(req.params.id);
      if (!before) {
        return res.status(404).json({ message: "User not found" });
      }
      const changes = {};
      if (typeof req.body.canEditBio === "boolean") {
        changes.canEditBio = req.body.canEditBio;
      }
      if (req.body.role !== undefined) {
        if (!["user", "admin"].includes(req.body.role)) {
          return res
            .status(400)
            .json({ message: "Role must be user or admin" });
        }
        changes.role = req.body.role;
      }
      if (req.body.permissions !== undefined) {
        const permissions = normalizePermissions(req.body.permissions);
        const unauthorizedGrant = Object.keys(permissions).find(
          (permission) =>
            before.permissions?.[permission] !== true &&
            req.user.permissions?.[permission] !== true,
        );
        if (unauthorizedGrant) {
          return res
            .status(403)
            .json({ message: `Cannot grant permission: ${unauthorizedGrant}` });
        }
        changes.permissions = permissions;
      }
      if (
        req.params.id === req.user.id &&
        (changes.role !== undefined || changes.permissions !== undefined)
      ) {
        return res
          .status(400)
          .json({ message: "You cannot change your own role or permissions" });
      }

      const user = await updateUserAdminSettings(req.params.id, changes);
      await createAdminAuditLog({
        actorUserId: req.user.id,
        action: "user.access.updated",
        targetType: "user",
        targetId: user.id,
        beforeState: before
          ? {
              role: before.role,
              permissions: before.permissions,
              canEditBio: before.canEditBio,
            }
          : null,
        afterState: {
          role: user.role,
          permissions: user.permissions,
          canEditBio: user.canEditBio,
        },
      });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/users/:id/notify",
  requirePermission(Permissions.NOTIFICATIONS_SEND),
  async (req, res, next) => {
    try {
      const title = String(req.body.title || "Complete your biodata");
      const message = String(
        req.body.message ||
          "Please complete your profile details so we can show better matches.",
      );
      const channels =
        Array.isArray(req.body.channels) && req.body.channels.length
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

      await createAdminAuditLog({
        actorUserId: req.user.id,
        action: "notification.sent",
        targetType: "user",
        targetId: req.params.id,
        afterState: { channels },
      });

      res.json({ notifications });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/profiles",
  requirePermission(Permissions.PROFILES_READ),
  async (req, res, next) => {
    try {
      res.json({
        profiles: await listProfiles({ ...req.query, includeUnverified: true }),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/profiles/:id",
  requirePermission(Permissions.PROFILES_UPDATE),
  async (req, res, next) => {
    try {
      const profile = await updateProfileById(
        req.params.id,
        profilePayload(req.body),
      );
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      await createAdminAuditLog({
        actorUserId: req.user.id,
        action: "profile.updated",
        targetType: "profile",
        targetId: profile.id,
      });
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/profiles/:id/lock",
  requirePermission(Permissions.PROFILES_LOCK),
  async (req, res, next) => {
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
      await createAdminAuditLog({
        actorUserId: req.user.id,
        action: "profile.lock.updated",
        targetType: "profile",
        targetId: profile.id,
        beforeState: { isLocked: existing.isLocked },
        afterState: { isLocked: profile.isLocked },
      });
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/profiles/:id/verify",
  requirePermission(Permissions.PROFILES_VERIFY),
  async (req, res, next) => {
    try {
      const existing = await getProfileById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const profile = await setProfileVerification(
        req.params.id,
        req.body.isVerified !== false,
      );
      await createAdminAuditLog({
        actorUserId: req.user.id,
        action: "profile.verification.updated",
        targetType: "profile",
        targetId: profile.id,
        beforeState: { isVerified: existing.isVerified },
        afterState: { isVerified: profile.isVerified },
      });
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  },
);

async function bulkDraftsFromRequest(req) {
  const drafts = [];
  const extractions = [];
  let aiUsed = false;
  const files = req.files || [];
  const firstFile = files[0];
  const fileName = firstFile?.originalname || "";
  const isJson =
    fileName.toLowerCase().endsWith(".json") ||
    firstFile?.mimetype === "application/json";

  if (
    isJson ||
    req.body.text?.trim()?.startsWith("[") ||
    req.body.text?.trim()?.startsWith("{")
  ) {
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
      extractions.push(extracted.confidence);
      aiUsed ||= extracted.aiUsed;
    }
    return { drafts, extractions, aiUsed, sourceType: "bulk-files" };
  }

  const extracted = await extractProfileWithAi({
    file: firstFile,
    text: req.body.text,
  });
  drafts.push(profilePayload(extracted.draft));
  return {
    drafts,
    extractions: [extracted.confidence],
    confidence: extracted.confidence,
    aiUsed: extracted.aiUsed,
    sourceType: extracted.sourceType,
  };
}

router.post(
  "/profiles/bulk-preview",
  requirePermission(Permissions.PROFILES_IMPORT),
  upload.array("source", 25),
  async (req, res, next) => {
    try {
      res.json(await bulkDraftsFromRequest(req));
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/profiles/bulk-create",
  requirePermission(Permissions.PROFILES_IMPORT),
  async (req, res, next) => {
    try {
      const created = [];
      const profiles = Array.isArray(req.body.profiles)
        ? req.body.profiles
        : [];
      if (!profiles.length) {
        return res
          .status(400)
          .json({ message: "Provide at least one reviewed profile" });
      }
      for (const profile of profiles) {
        created.push(await createStandaloneProfile(profilePayload(profile)));
      }
      await createAdminAuditLog({
        actorUserId: req.user.id,
        action: "profiles.bulk.created",
        targetType: "profile",
        afterState: { count: created.length },
      });
      res.status(201).json({ created });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/profiles/bulk-upload",
  requirePermission(Permissions.PROFILES_IMPORT),
  upload.array("source", 25),
  async (req, res, next) => {
    try {
      const { drafts, extractions, aiUsed, sourceType } =
        await bulkDraftsFromRequest(req);
      const created = [];
      for (const draft of drafts) {
        created.push(await createStandaloneProfile(draft));
      }
      await createAdminAuditLog({
        actorUserId: req.user.id,
        action: "profiles.bulk.uploaded",
        targetType: "profile",
        afterState: {
          count: created.length,
          aiUsed,
          sourceType,
          confidenceScores: extractions?.map((item) => item?.score),
        },
      });
      return res.json({ created, extractions, aiUsed, sourceType });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
