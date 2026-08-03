const Permissions = Object.freeze({
  ADMIN_DASHBOARD_VIEW: "admin.dashboard.view",
  ADMIN_SETTINGS_READ: "admin.settings.read",
  ADMIN_SETTINGS_UPDATE: "admin.settings.update",
  NOTIFICATIONS_SEND: "notifications.send",
  PROFILES_IMPORT: "profiles.import",
  PROFILES_LOCK: "profiles.lock",
  PROFILES_READ: "profiles.read",
  PROFILES_UPDATE: "profiles.update",
  PROFILES_VERIFY: "profiles.verify",
  USERS_MANAGE_ACCESS: "users.manage_access",
  USERS_READ: "users.read",
});

const permissionValues = Object.freeze(Object.values(Permissions));
const permissionSet = new Set(permissionValues);

function normalizePermissions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const err = new Error("Permissions must be an object");
    err.status = 400;
    throw err;
  }

  const normalized = {};
  for (const [permission, enabled] of Object.entries(value)) {
    if (!permissionSet.has(permission) || typeof enabled !== "boolean") {
      const err = new Error(`Invalid permission: ${permission}`);
      err.status = 400;
      throw err;
    }
    if (enabled) {
      normalized[permission] = true;
    }
  }
  return normalized;
}

function hasPermission(user, permission) {
  return user?.role === "admin" && user.permissions?.[permission] === true;
}

module.exports = {
  Permissions,
  hasPermission,
  normalizePermissions,
  permissionValues,
};
