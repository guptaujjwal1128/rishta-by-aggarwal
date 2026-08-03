import {
  Alert,
  Box,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EmailIcon from "@mui/icons-material/Email";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import Header from "../../components/molecule/layout/header/Header";
import { Content, ContentContainer } from "../../styles/Layout.styled";

const providerCards = [
  {
    icon: <SmartToyIcon color="primary" />,
    title: "Vertex AI extraction",
    status: "Confidence-routed",
    helper:
      "Uses a cost-efficient primary model and retries low-confidence extraction with the secondary model through the Cloud Run identity.",
  },
  {
    icon: <EmailIcon color="primary" />,
    title: "Email provider",
    status: "Pending SMTP keys",
    helper:
      "Queued notifications can be sent after provider credentials are added.",
  },
  {
    icon: <WhatsAppIcon color="primary" />,
    title: "WhatsApp provider",
    status: "Pending provider keys",
    helper:
      "Phone based reminders are queued until a WhatsApp host is connected.",
  },
];

const AdminSettings = () => {
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
            <Typography variant="h3">Admin Settings</Typography>
            <Typography color="text.secondary">
              Configure profile moderation, notification providers, and platform
              defaults.
            </Typography>
          </Box>

          <Alert severity="info">
            Production secret values stay in GCP Secret Manager. Vertex AI uses
            the backend Cloud Run service identity, so there is no AI API key.
          </Alert>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "0.95fr 1fr" },
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
                <Stack direction="row" gap={1} alignItems="center">
                  <AdminPanelSettingsIcon color="primary" />
                  <Typography variant="h5">Moderation Defaults</Typography>
                </Stack>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="New bulk-uploaded profiles start unverified"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Only verified profiles appear in user gallery"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Allow admin to lock user biodata editing"
                />
                <TextField
                  label="Default reminder message"
                  multiline
                  minRows={4}
                  defaultValue="Please complete your biodata so we can show better matches."
                />
              </Stack>
            </Paper>

            <Stack gap={2}>
              {providerCards.map((card) => (
                <Paper
                  key={card.title}
                  className="soft-card"
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "border.secondary",
                    borderRadius: 1,
                    p: 2.25,
                  }}
                >
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: "rgba(241, 184, 75, 0.16)",
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box>
                      <Stack
                        direction="row"
                        gap={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Typography variant="body2Bold">
                          {card.title}
                        </Typography>
                        <Chip size="small" label={card.status} />
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                      >
                        {card.helper}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Content>
    </ContentContainer>
  );
};

export default AdminSettings;
