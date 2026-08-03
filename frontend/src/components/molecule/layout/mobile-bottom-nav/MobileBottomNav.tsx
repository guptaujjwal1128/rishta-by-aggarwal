import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useLocation } from "react-router";

import {
  AppRoutes,
  type AppRoutes as AppRoutePath,
} from "../../../../constants/routes";
import { useAuth } from "../../../../context/AuthContext";
import {
  hasPermission,
  Permissions,
  type Permission,
} from "../../../../constants/permissions";
import useNavigation from "../../../../hooks/useNavigation";

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { goTo } = useNavigation();
  const { pathname } = useLocation();

  if (!user) {
    return null;
  }

  const items: {
    label: string;
    path: AppRoutePath;
    icon: ReactNode;
    permission?: Permission;
  }[] =
    user.role === "admin"
      ? [
          {
            label: "Admin",
            path: AppRoutes.ADMIN_DASHBOARD,
            icon: <AdminPanelSettingsIcon />,
            permission: Permissions.ADMIN_DASHBOARD_VIEW,
          },
          {
            label: "Users",
            path: AppRoutes.ADMIN_USERS,
            icon: <GroupIcon />,
            permission: Permissions.USERS_READ,
          },
          {
            label: "Messages",
            path: AppRoutes.ADMIN_QUERIES,
            icon: <EmailIcon />,
            permission: Permissions.NOTIFICATIONS_SEND,
          },
          {
            label: "Settings",
            path: AppRoutes.ADMIN_SETTINGS,
            icon: <SettingsIcon />,
            permission: Permissions.ADMIN_SETTINGS_READ,
          },
        ].filter((item) => hasPermission(user, item.permission))
      : [
          {
            label: "Gallery",
            path: AppRoutes.DASHBOARD,
            icon: <DashboardIcon />,
          },
          { label: "Biodata", path: AppRoutes.PROFILE, icon: <PersonIcon /> },
          {
            label: "Settings",
            path: AppRoutes.SETTINGS,
            icon: <SettingsIcon />,
          },
        ];

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        borderTop: "1px solid",
        borderColor: "border.secondary",
        borderRadius: 0,
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(16px)",
        px: 1,
        py: 0.75,
      }}
    >
      <Stack direction="row" justifyContent="space-around">
        {items.map((item) => {
          const active =
            pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Stack
              key={item.path}
              component="button"
              alignItems="center"
              gap={0.25}
              onClick={() => {
                void goTo(item.path);
              }}
              sx={{
                width: 76,
                border: 0,
                background: "transparent",
                color: active ? "primary.main" : "text.secondary",
                py: 0.5,
                cursor: "pointer",
              }}
            >
              {item.icon}
              <Typography variant="body3Bold">{item.label}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default MobileBottomNav;
