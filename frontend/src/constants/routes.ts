export const AppRoutes = {
  HOME: "/",
  CONTACT: "/contact",
  LOGIN: "/login",
  REGISTER: "/register",

  // Admin Routes
  ADMIN_ROOT: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAILS: "/admin/users/:id",
  ADMIN_QUERIES: "/admin/queries",
  ADMIN_SETTINGS: "/admin/settings",

  // User Routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;

export type AppRoutes = (typeof AppRoutes)[keyof typeof AppRoutes];
