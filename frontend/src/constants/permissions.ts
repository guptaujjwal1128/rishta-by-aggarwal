import type { User } from "../types/domain";

export const Permissions = {
  ADMIN_DASHBOARD_VIEW: "admin.dashboard.view",
  ADMIN_SETTINGS_READ: "admin.settings.read",
  ADMIN_SETTINGS_UPDATE: "admin.settings.update",
  NOTIFICATIONS_SEND: "notifications.send",
  PROFILES_IMPORT: "profiles.import",
  PROFILES_LOCK: "profiles.lock",
  PROFILES_READ: "profiles.read",
  PROFILES_VERIFY: "profiles.verify",
  USERS_MANAGE_ACCESS: "users.manage_access",
  USERS_READ: "users.read",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const permissionValues = Object.values(Permissions);

export function hasPermission(user: User | null, permission: Permission) {
  return user?.role === "admin" && user.permissions[permission] === true;
}
