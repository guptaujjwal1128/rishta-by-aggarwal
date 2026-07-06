import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { PrimaryButton } from "../../components/atom/button/Button";
import Footer from "../../components/molecule/layout/footer/Footer";
import Header from "../../components/molecule/layout/header/Header";
import { Content, ContentContainer } from "../../styles/Layout.styled";

const contactItems = [
  {
    icon: <EmailIcon />,
    label: "contact@rishtabyaggarwal.com",
  },
  {
    icon: <PhoneIcon />,
    label: "+91 98765 43210",
  },
  {
    icon: <LocationOnIcon />,
    label: "New Delhi, India",
  },
];

const ContactUs = () => {
  return (
    <ContentContainer>
      <Content component="header">
        <Header />
      </Content>
      <Divider flexItem />

      <Content
        component="main"
        sx={{
          px: { xs: 2, sm: 4 },
          py: { xs: 4, md: 7 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1fr" },
            gap: { xs: 4, md: 8 },
            alignItems: "center",
            maxWidth: 980,
            mx: "auto",
          }}
        >
          <Stack gap={3} className="page-rise">
            <Box>
              <Typography variant="h2" component="h1">
                Get in Touch
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Reach out for profile support, verification help, or questions
                about biodata uploads.
              </Typography>
            </Box>

            <Stack gap={2.25}>
              {contactItems.map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  alignItems="center"
                  gap={2}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "secondary.main",
                      backgroundColor: "rgba(241, 184, 75, 0.16)",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="body1">{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Paper
            className="soft-card page-rise"
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "border.secondary",
              borderRadius: { xs: 3, md: 2 },
              p: { xs: 3, sm: 4 },
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,241,0.84))",
            }}
          >
            <Stack gap={2.25}>
              <Typography variant="h4">Send us a Message</Typography>
              <TextField label="Full Name" placeholder="Your name" />
              <TextField
                label="Email Address"
                placeholder="you@example.com"
                type="email"
              />
              <TextField
                label="Your Message"
                placeholder="Write your message here..."
                multiline
                minRows={5}
              />
              <PrimaryButton size="large" endIcon={<SendIcon />}>
                Send Message
              </PrimaryButton>
            </Stack>
          </Paper>
        </Box>
      </Content>

      <Divider flexItem />
      <Content component="footer">
        <Footer />
      </Content>
    </ContentContainer>
  );
};

export default ContactUs;
