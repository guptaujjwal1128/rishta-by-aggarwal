const { OAuth2Client } = require("google-auth-library");

const { GOOGLE_CLIENT_ID } = require("../config");

const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

async function verifyGoogleCredential(credential) {
  if (!googleClient) {
    const err = new Error(
      "GOOGLE_CLIENT_ID is required to verify Google SSO tokens",
    );
    err.status = 500;
    throw err;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    const err = new Error("Google token did not include an email");
    err.status = 401;
    throw err;
  }

  return {
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    phone: "",
  };
}

async function resolveSocialIdentity(provider, body) {
  if (provider === "google" && body.credential) {
    return verifyGoogleCredential(body.credential);
  }

  return {
    email: String(body.email || "")
      .trim()
      .toLowerCase(),
    name: String(body.name || "").trim(),
    phone: String(body.phone || "")
      .replace(/\s+/g, "")
      .trim(),
  };
}

module.exports = {
  resolveSocialIdentity,
};
