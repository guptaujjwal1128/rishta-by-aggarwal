const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config");
const {
  createUser,
  findUserByEmailOrPhone,
  findUserByIdentifier,
  upsertSocialUser,
} = require("../db/postgres");
const { authenticate } = require("../middleware/auth");
const { resolveSocialIdentity } = require("../services/socialAuth");

const router = express.Router();

function issueToken(user) {
  return jwt.sign({}, JWT_SECRET, { expiresIn: "7d", subject: user.id });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role || "user",
    permissions: user.permissions || {},
    canEditBio: user.canEditBio !== false,
    authProvider: user.authProvider || "password",
    createdAt: user.createdAt,
  };
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || "")
    .replace(/\s+/g, "")
    .trim();
}

function requireBody(fields, body) {
  const missing = fields.filter((field) => !String(body[field] || "").trim());
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

router.post("/register", async (req, res, next) => {
  try {
    requireBody(["name", "email", "phone", "password"], req.body);

    if (String(req.body.password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const passwordHash = await bcrypt.hash(String(req.body.password), 10);
    const exists = await findUserByEmailOrPhone(email, phone);
    if (exists) {
      return res
        .status(409)
        .json({ message: "A user with this email or phone already exists" });
    }

    const createdUser = await createUser({
      name: String(req.body.name).trim(),
      email,
      phone,
      passwordHash,
    });

    res.status(201).json({
      token: issueToken(createdUser),
      user: publicUser(createdUser),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    requireBody(["identifier", "password"], req.body);

    const identifier = String(req.body.identifier).trim().toLowerCase();
    const user = await findUserByIdentifier(
      normalizePhone(identifier) || identifier,
    );

    if (!user || !user.passwordHash) {
      return res
        .status(401)
        .json({ message: "Invalid email, phone, or password" });
    }

    const ok = await bcrypt.compare(
      String(req.body.password),
      user.passwordHash,
    );
    if (!ok) {
      return res
        .status(401)
        .json({ message: "Invalid email, phone, or password" });
    }

    res.json({
      token: issueToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/social", async (req, res, next) => {
  try {
    const provider = String(req.body.provider || "").toLowerCase();
    if (!["google", "facebook"].includes(provider)) {
      return res
        .status(400)
        .json({ message: "Supported providers: google, facebook" });
    }

    const identity = await resolveSocialIdentity(provider, req.body);
    if (!identity.email) {
      return res.status(400).json({
        message: "Social sign-in requires an email or provider token",
      });
    }

    const email = normalizeEmail(identity.email);
    const phone = normalizePhone(identity.phone);
    const socialUser = await upsertSocialUser({
      provider,
      name: String(identity.name || "").trim(),
      email,
      phone,
    });

    res.json({
      token: issueToken(socialUser),
      user: publicUser(socialUser),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate(), async (req, res, next) => {
  try {
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
