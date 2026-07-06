import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PhoneIcon from "@mui/icons-material/Phone";

import Header from "../../components/molecule/layout/header/Header";
import { useAuth } from "../../context/AuthContext";
import { Content, ContentContainer } from "../../styles/Layout.styled";

const Settings = () => {
  const { user } = useAuth();

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
            <Typography variant="h3">Settings</Typography>
            <Typography color="text.secondary">
              Manage account details, privacy, and biodata notifications.
            </Typography>
          </Box>

          <Alert severity="info">
            Contact details are used for biodata communication and admin
            reminders.
          </Alert>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 0.85fr" },
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
              <Stack gap={2.25}>
                <Typography variant="h5">Account</Typography>
                <TextField
                  label="Name"
                  value={user?.name || ""}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Email"
                  value={user?.email || ""}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  label="Phone"
                  value={user?.phone || ""}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <Button variant="outlined" startIcon={<LockIcon />} disabled>
                  Password change coming soon
                </Button>
              </Stack>
            </Paper>

            <Stack gap={2}>
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
                <Stack gap={1.5}>
                  <Typography variant="h5">Privacy</Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Show my verified biodata in gallery"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Allow admins to send completion reminders"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Hide contact details in preview"
                  />
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
                <Stack gap={1.5}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <NotificationsIcon color="primary" />
                    <Typography variant="h5">Notifications</Typography>
                  </Stack>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <Chip label="In-app reminders" color="primary" />
                    <Chip label="Email ready" />
                    <Chip label="WhatsApp ready after keys" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Email and WhatsApp provider settings can be connected from
                    admin settings.
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Content>
    </ContentContainer>
  );
};

export default Settings;
