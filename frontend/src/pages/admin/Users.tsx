import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import Header from "../../components/molecule/layout/header/Header";
import { useAuth } from "../../context/AuthContext";
import {
  hasPermission,
  Permissions,
  permissionValues,
  type Permission,
} from "../../constants/permissions";
import {
  adminListUsers,
  adminNotifyUser,
  adminUpdateUser,
} from "../../services/api";
import { Content, ContentContainer } from "../../styles/Layout.styled";
import type { AdminUser } from "../../types/domain";

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notifyUser, setNotifyUser] = useState<AdminUser | null>(null);
  const [notifyForm, setNotifyForm] = useState({
    title: "Complete your biodata",
    message: "Please complete your biodata so we can show better matches.",
    channels: ["app"],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canManageAccess = hasPermission(
    currentUser,
    Permissions.USERS_MANAGE_ACCESS,
  );
  const canSendNotifications = hasPermission(
    currentUser,
    Permissions.NOTIFICATIONS_SEND,
  );

  const load = async () => {
    const { users: nextUsers } = await adminListUsers();
    setUsers(nextUsers);
  };

  useEffect(() => {
    void adminListUsers()
      .then(({ users: nextUsers }) => {
        setUsers(nextUsers);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load users");
      });
  }, []);

  const toggleEdit = async (user: AdminUser) => {
    setError("");
    setMessage("");
    try {
      await adminUpdateUser(user.id, { canEditBio: !user.canEditBio });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update user");
    }
  };

  const toggleRole = async (user: AdminUser) => {
    setError("");
    setMessage("");
    try {
      await adminUpdateUser(user.id, {
        role: user.role === "admin" ? "user" : "admin",
        permissions: user.role === "admin" ? {} : user.permissions,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    }
  };

  const togglePermission = async (user: AdminUser, permission: Permission) => {
    setError("");
    setMessage("");
    try {
      await adminUpdateUser(user.id, {
        permissions: {
          ...user.permissions,
          [permission]: user.permissions[permission] !== true,
        },
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update permissions",
      );
    }
  };

  const openNotify = (user: AdminUser) => {
    setNotifyUser(user);
    setNotifyForm({
      title: "Complete your biodata",
      message: `Hi ${user.name}, please complete your biodata so we can show better matches.`,
      channels: ["app"],
    });
  };

  const toggleChannel = (channel: string) => {
    setNotifyForm((current) => ({
      ...current,
      channels: current.channels.includes(channel)
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel],
    }));
  };

  const notify = async () => {
    if (!notifyUser) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await adminNotifyUser(notifyUser.id, {
        channels: notifyForm.channels,
        title: notifyForm.title,
        message: notifyForm.message,
      });
      setMessage(`Notification queued for ${notifyUser.name}.`);
      setNotifyUser(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send notification",
      );
    }
  };

  return (
    <ContentContainer>
      <Content component="header">
        <Header />
      </Content>
      <Divider flexItem />
      <Content
        component="main"
        sx={{ px: { xs: 2, sm: 4 }, py: 4, pb: { xs: 11, md: 4 } }}
      >
        <Stack gap={3}>
          <Box>
            <Typography variant="h3">Users</Typography>
            <Typography color="text.secondary">
              Profile completion, edit permissions, and reminders.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {message ? <Alert severity="success">{message}</Alert> : null}

          <Paper
            className="soft-card"
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "border.secondary",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack gap={2}>
              {users.map((user) => (
                <Stack
                  key={user.id}
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  gap={2}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "border.secondary",
                    pb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2Bold">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[user.email, user.phone].filter(Boolean).join(" | ")}
                    </Typography>
                    <Stack direction="row" gap={1} mt={1} flexWrap="wrap">
                      <Chip size="small" label={user.role} />
                      <Chip
                        size="small"
                        label={`${user.completion}% complete`}
                        color={user.completion < 80 ? "warning" : "success"}
                      />
                      {user.profileLocked ? (
                        <Chip
                          size="small"
                          label="Profile locked"
                          color="warning"
                        />
                      ) : null}
                    </Stack>
                  </Box>

                  <Stack direction="column" gap={1} alignItems="stretch">
                    <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                      {canManageAccess ? (
                        <>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={user.canEditBio !== false}
                                onChange={() => void toggleEdit(user)}
                              />
                            }
                            label="Can edit bio"
                          />
                          <Button
                            variant="outlined"
                            disabled={user.id === currentUser?.id}
                            onClick={() => void toggleRole(user)}
                          >
                            Make {user.role === "admin" ? "user" : "admin"}
                          </Button>
                        </>
                      ) : null}
                      {canSendNotifications ? (
                        <Button
                          variant="outlined"
                          startIcon={<NotificationsIcon />}
                          onClick={() => openNotify(user)}
                        >
                          Notify
                        </Button>
                      ) : null}
                    </Stack>
                    {canManageAccess && user.role === "admin" ? (
                      <Stack direction="row" gap={0.5} flexWrap="wrap">
                        {permissionValues.map((permission) => (
                          <FormControlLabel
                            key={permission}
                            control={
                              <Checkbox
                                size="small"
                                checked={user.permissions[permission] === true}
                                disabled={user.id === currentUser?.id}
                                onChange={() =>
                                  void togglePermission(user, permission)
                                }
                              />
                            }
                            label={permission}
                          />
                        ))}
                      </Stack>
                    ) : null}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Content>

      <Dialog
        open={Boolean(notifyUser)}
        onClose={() => {
          setNotifyUser(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Send completion reminder</DialogTitle>
        <DialogContent>
          <Stack gap={2} pt={1}>
            <Typography variant="body2" color="text.secondary">
              {notifyUser?.name} is {notifyUser?.completion ?? 0}% complete.
            </Typography>
            <TextField
              label="Title"
              value={notifyForm.title}
              onChange={(event) =>
                setNotifyForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
            <TextField
              label="Message"
              value={notifyForm.message}
              multiline
              minRows={4}
              onChange={(event) =>
                setNotifyForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
            />
            <Stack direction="row" gap={1} flexWrap="wrap">
              {["app", "email", "whatsapp"].map((channel) => (
                <FormControlLabel
                  key={channel}
                  control={
                    <Checkbox
                      checked={notifyForm.channels.includes(channel)}
                      onChange={() => toggleChannel(channel)}
                    />
                  }
                  label={channel === "app" ? "In-app" : channel}
                />
              ))}
            </Stack>
            <Alert severity="info">
              Email and WhatsApp are queued for now. Once SMTP and WhatsApp
              provider keys are added, these queued channels can be sent by a
              worker/provider hook.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifyUser(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              !notifyForm.title.trim() ||
              !notifyForm.message.trim() ||
              !notifyForm.channels.length
            }
            onClick={() => void notify()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </ContentContainer>
  );
};

export default Users;
