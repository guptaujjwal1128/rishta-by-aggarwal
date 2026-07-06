import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ReplyIcon from "@mui/icons-material/Reply";
import SearchIcon from "@mui/icons-material/Search";

import Header from "../../components/molecule/layout/header/Header";
import { Content, ContentContainer } from "../../styles/Layout.styled";

const messages = [
  {
    name: "Rahul Gupta",
    to: "Admin team",
    time: "10:30 AM",
    text: "I wanted to inquire about completing and verifying my biodata profile.",
    unread: true,
  },
  {
    name: "Priya Sharma",
    to: "Profile support",
    time: "Yesterday",
    text: "Thanks for the information. I will upload the remaining details today.",
  },
  {
    name: "Amit Patel",
    to: "Admin team",
    time: "2 days ago",
    text: "Is there a way to filter profiles by profession and food preference?",
  },
  {
    name: "Neha Gupta",
    to: "Verification",
    time: "3 days ago",
    text: "My profile is ready for review. Please verify it when possible.",
    unread: true,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const Queries = () => {
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
            <Typography variant="h3">User Messages</Typography>
            <Typography color="text.secondary">
              Track user questions, verification requests, and completion
              reminders.
            </Typography>
          </Box>

          <TextField
            placeholder="Search by name, ID, or keyword..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { md: 520 },
              ".MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 236, 226, 0.82)",
              },
            }}
          />

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
                overflow: "hidden",
              }}
            >
              {messages.map((message, index) => (
                <Stack
                  key={`${message.name}-${message.time}`}
                  direction="row"
                  gap={1.5}
                  sx={{
                    p: 2,
                    borderTop: index ? "1px solid" : 0,
                    borderColor: "border.secondary",
                    backgroundColor: message.unread
                      ? "rgba(255, 236, 226, 0.76)"
                      : "transparent",
                  }}
                >
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {initials(message.name)}
                  </Avatar>
                  <Box minWidth={0} flex={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Typography variant="body2Bold" noWrap>
                        {message.name}
                      </Typography>
                      <Typography variant="body3" color="text.secondary" noWrap>
                        {message.time}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {message.text}
                    </Typography>
                    <Typography variant="body3" color="text.secondary">
                      To: {message.to}
                    </Typography>
                  </Box>
                  {message.unread ? (
                    <Chip size="small" color="secondary" label="New" />
                  ) : null}
                </Stack>
              ))}
            </Paper>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {messages.map((message) => (
                <Paper
                  key={`${message.name}-card`}
                  className="soft-card"
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "border.secondary",
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: message.unread
                      ? "rgba(255, 236, 226, 0.64)"
                      : "#FFFFFF",
                  }}
                >
                  <Stack gap={1.5}>
                    <Stack direction="row" gap={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {initials(message.name)}
                      </Avatar>
                      <Box minWidth={0}>
                        <Typography variant="body2Bold" noWrap>
                          {message.name}
                        </Typography>
                        <Typography variant="body3" color="text.secondary">
                          {message.time}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2">{message.text}</Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReplyIcon />}
                      >
                        Reply
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<MarkEmailReadIcon />}
                      >
                        Mark read
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Box>
        </Stack>
      </Content>
    </ContentContainer>
  );
};

export default Queries;
