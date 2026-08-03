// External
import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../../../components/atom/button/Button";
import { NavLink } from "react-router";

// Internal
import useNavigation from "../../../../hooks/useNavigation";
import {
  AppRoutes,
  type AppRoutes as AppRoutePath,
} from "../../../../constants/routes";
import { TEXT } from "../../../../constants/TEXT";
import { ASSETS } from "../../../../constants/ASSETS";
import { useAuth } from "../../../../context/AuthContext";
import { hasPermission, Permissions } from "../../../../constants/permissions";
const { header } = TEXT;

const Header = () => {
  const { goTo } = useNavigation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateTo = (path: AppRoutePath) => {
    setMenuOpen(false);
    void goTo(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    void goTo(AppRoutes.HOME);
  };

  const adminPath =
    hasPermission(user, Permissions.ADMIN_DASHBOARD_VIEW) &&
    hasPermission(user, Permissions.PROFILES_READ)
      ? AppRoutes.ADMIN_DASHBOARD
      : hasPermission(user, Permissions.USERS_READ)
        ? AppRoutes.ADMIN_USERS
        : hasPermission(user, Permissions.NOTIFICATIONS_SEND)
          ? AppRoutes.ADMIN_QUERIES
          : hasPermission(user, Permissions.ADMIN_SETTINGS_READ)
            ? AppRoutes.ADMIN_SETTINGS
            : null;

  const navItems: {
    label: string;
    path: AppRoutePath;
    primary?: boolean;
  }[] = user
    ? [
        ...(user.role !== "admin"
          ? [{ label: "My Biodata", path: AppRoutes.PROFILE }]
          : []),
        { label: "Dashboard", path: AppRoutes.DASHBOARD, primary: true },
        ...(user.role === "admin" && adminPath
          ? [{ label: "Admin", path: adminPath }]
          : []),
      ]
    : [
        { label: header.login, path: AppRoutes.LOGIN },
        { label: header.joinNow, path: AppRoutes.REGISTER, primary: true },
      ];

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        gap: { xs: 1, md: 2 },
        py: 1.5,
        px: { xs: 2, sm: 4 },
        backgroundColor: "rgba(255, 248, 241, 0.78)",
        backdropFilter: "blur(14px)",
      }}
      maxWidth="xl"
      width="100%"
    >
      <NavLink className="link-styling" to={AppRoutes.HOME}>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Box
            component="img"
            src={ASSETS.common.banner}
            alt=""
            height={{ xs: 30, md: 40 }}
            width={{ xs: 30, md: 40 }}
          />
          <Typography
            variant="h5"
            component="h1"
            color="primary"
            sx={{
              fontSize: { xs: "1rem", sm: "1.375rem" },
              whiteSpace: "nowrap",
            }}
          >
            {header.brandName}
          </Typography>
        </Stack>
      </NavLink>
      <Stack
        component="nav"
        direction="row"
        alignItems="center"
        sx={{ display: { xs: "none", md: "flex" }, gap: { xs: 1, md: 2 } }}
      >
        {navItems.map((item) =>
          item.primary ? (
            <PrimaryButton
              key={item.label}
              component="a"
              onClick={() => {
                navigateTo(item.path);
              }}
            >
              <Typography variant="body2Bold">{item.label}</Typography>
            </PrimaryButton>
          ) : (
            <SecondaryButton
              key={item.label}
              component="a"
              onClick={() => {
                navigateTo(item.path);
              }}
            >
              <Typography variant="body2Bold">{item.label}</Typography>
            </SecondaryButton>
          ),
        )}
        {user ? (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : null}
      </Stack>

      <IconButton
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
        sx={{ display: { xs: "inline-flex", md: "none" } }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Stack sx={{ width: 280, p: 2 }} gap={1.5}>
          <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
            {header.brandName}
          </Typography>
          {navItems.map((item) =>
            item.primary ? (
              <PrimaryButton
                key={item.label}
                fullWidth
                onClick={() => {
                  navigateTo(item.path);
                }}
              >
                {item.label}
              </PrimaryButton>
            ) : (
              <SecondaryButton
                key={item.label}
                fullWidth
                onClick={() => {
                  navigateTo(item.path);
                }}
              >
                {item.label}
              </SecondaryButton>
            ),
          )}
          {user ? (
            <Button
              fullWidth
              color="inherit"
              onClick={handleLogout}
              sx={{ justifyContent: "flex-start" }}
            >
              Logout
            </Button>
          ) : null}
        </Stack>
      </Drawer>
    </Stack>
  );
};

export default Header;
