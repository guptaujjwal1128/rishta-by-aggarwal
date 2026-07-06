import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import Header from "../../components/molecule/layout/header/Header";
import { adminListUsers } from "../../services/api";
import { Content, ContentContainer } from "../../styles/Layout.styled";
import type { AdminUser } from "../../types/domain";

const UserDetails = () => {
  const { id } = useParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void adminListUsers()
      .then(({ users: nextUsers }) => setUsers(nextUsers))
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Could not load user details",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const user = useMemo(() => users.find((item) => item.id === id), [id, users]);

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
            <Typography variant="h3">User Details</Typography>
            <Typography color="text.secondary">
              Review profile completion, permissions, and moderation status.
            </Typography>
          </Box>

          {loading ? (
            <Box minHeight={300} display="grid" sx={{ placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : !user ? (
            <Alert severity="warning">User not found.</Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "0.8fr 1.2fr" },
                gap: 2,
              }}
            >
              <Paper
                className="soft-card"
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "border.secondary",
                  borderRadius: 1,
                  p: 2.5,
                }}
              >
                <Stack gap={2}>
                  <Box>
                    <Typography variant="h4">{user.name}</Typography>
                    <Typography color="text.secondary">
                      {[user.email, user.phone].filter(Boolean).join(" | ")}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <Chip label={user.role} />
                    <Chip
                      color={user.completion < 80 ? "warning" : "success"}
                      label={`${user.completion}% complete`}
                    />
                    {user.profileLocked ? (
                      <Chip color="warning" label="Profile locked" />
                    ) : null}
                  </Stack>
                  <Box>
                    <Typography variant="body2Bold">Completion</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={user.completion}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Stack>
              </Paper>

              <Paper
                className="soft-card"
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "border.secondary",
                  borderRadius: 1,
                  p: 2.5,
                }}
              >
                <Stack gap={2}>
                  <Typography variant="h5">Permissions</Typography>
                  <FormControlLabel
                    control={
                      <Switch checked={user.canEditBio !== false} readOnly />
                    }
                    label="User can edit biodata"
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<NotificationsIcon />}
                    >
                      Send reminder
                    </Button>
                    <Button variant="outlined" startIcon={<LockIcon />}>
                      {user.profileLocked ? "Unlock profile" : "Lock profile"}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<VerifiedUserIcon />}
                    >
                      Review profile
                    </Button>
                  </Stack>
                  <Alert severity="info">
                    Use the Users page for live edit-permission changes and
                    custom notification messages.
                  </Alert>
                </Stack>
              </Paper>
            </Box>
          )}
        </Stack>
      </Content>
    </ContentContainer>
  );
};

export default UserDetails;
