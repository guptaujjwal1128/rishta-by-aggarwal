import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { PrimaryButton } from "../../components/atom/button/Button";
import Header from "../../components/molecule/layout/header/Header";
import SocialAuthPanel from "../../components/molecule/auth/SocialAuthPanel";
import { AppRoutes } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { Content, ContentContainer } from "../../styles/Layout.styled";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const goToProfile = () => {
    void navigate(AppRoutes.PROFILE, { replace: true });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      goToProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
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
          maxWidth={680}
        >
          <Typography variant="h2" component="h1">
            Create your account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload biodata or fill details manually after signup.
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
            maxWidth: 680,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,248,241,0.88))",
          }}
        >
          <Stack gap={3}>
            <Box>
              <Typography variant="h4" component="h2">
                Sign up
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email and phone are both captured for profile verification.
              </Typography>
            </Box>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Stack
              component="form"
              gap={2}
              onSubmit={(event) => {
                void submit(event);
              }}
            >
              <TextField
                required
                label="Full name"
                value={form.name}
                onChange={(event) => {
                  updateField("name", event.target.value);
                }}
              />
              <TextField
                required
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => {
                  updateField("email", event.target.value);
                }}
              />
              <TextField
                required
                label="Phone"
                value={form.phone}
                onChange={(event) => {
                  updateField("phone", event.target.value);
                }}
              />
              <TextField
                required
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => {
                  updateField("password", event.target.value);
                }}
              />
              <TextField
                required
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => {
                  updateField("confirmPassword", event.target.value);
                }}
              />
              <PrimaryButton
                type="submit"
                disabled={submitting}
                startIcon={<PersonAddIcon />}
              >
                {submitting ? "Creating account..." : "Create account"}
              </PrimaryButton>
            </Stack>
            <Divider>or</Divider>
            <SocialAuthPanel mode="register" onSuccess={goToProfile} />
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link component={RouterLink} to={AppRoutes.LOGIN}>
                Login
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Content>
    </ContentContainer>
  );
};

export default Register;
