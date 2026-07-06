import { useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import {
  Alert,
  Box,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

import { PrimaryButton } from "../../components/atom/button/Button";
import Header from "../../components/molecule/layout/header/Header";
import SocialAuthPanel from "../../components/molecule/auth/SocialAuthPanel";
import { AppRoutes } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { Content, ContentContainer } from "../../styles/Layout.styled";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const locationState = location.state as LocationState | null;
  const nextPath = locationState?.from?.pathname || AppRoutes.DASHBOARD;

  const onSuccess = () => {
    void navigate(nextPath, { replace: true });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login({ identifier, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in");
    } finally {
      setSubmitting(false);
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
        sx={{
          px: { xs: 2, sm: 4 },
          py: { xs: 4, md: 7 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 4 },
          alignItems: "center",
          minHeight: "calc(100vh - 90px)",
        }}
      >
        <Stack
          gap={1.25}
          className="page-rise"
          textAlign="center"
          maxWidth={620}
        >
          <Typography variant="h2" component="h1">
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to manage biodata and browse verified profiles.
          </Typography>
        </Stack>

        <Paper
          className="soft-card page-rise"
          component="section"
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "border.secondary",
            borderRadius: 1,
            p: { xs: 2.5, sm: 4 },
            width: "100%",
            maxWidth: 620,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,248,241,0.88))",
          }}
        >
          <Stack gap={3}>
            <Box>
              <Typography variant="h4" component="h2">
                Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use your email or phone number.
              </Typography>
            </Box>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Stack component="form" gap={2} onSubmit={submit}>
              <TextField
                required
                label="Email or phone"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                }}
              />
              <TextField
                required
                label="Password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              <PrimaryButton
                type="submit"
                disabled={submitting}
                startIcon={<LoginIcon />}
              >
                {submitting ? "Logging in..." : "Login"}
              </PrimaryButton>
            </Stack>
            <Divider>or</Divider>
            <SocialAuthPanel mode="login" onSuccess={onSuccess} />
            <Typography variant="body2" color="text.secondary">
              New here?{" "}
              <Link component={RouterLink} to={AppRoutes.REGISTER}>
                Create an account
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Content>
    </ContentContainer>
  );
};

export default Login;
