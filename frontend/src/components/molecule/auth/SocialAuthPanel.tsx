import { useCallback, useState, type FormEvent } from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";

interface SocialAuthPanelProps {
  mode: "login" | "register";
  onSuccess: () => void;
}

type Provider = "google" | "facebook";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  prompt: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const providerLabel: Record<Provider, string> = {
  google: "Google",
  facebook: "Facebook",
};

function googleClientId() {
  return (
    window.__APP_CONFIG__?.VITE_GOOGLE_CLIENT_ID ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ""
  );
}
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  googleScriptPromise ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google SSO failed to load")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Google SSO failed to load")),
      {
        once: true,
      },
    );
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

const SocialAuthPanel = ({ mode, onSuccess }: SocialAuthPanelProps) => {
  const { socialLogin } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setProvider(null);
    setError("");
  };

  const continueWithGoogle = useCallback(async () => {
    const clientId = googleClientId();
    if (!clientId) {
      setProvider("google");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await loadGoogleScript();
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          void (async () => {
            if (!response.credential) {
              setError("Google did not return a sign-in credential");
              return;
            }
            try {
              await socialLogin({
                provider: "google",
                credential: response.credential,
              });
              onSuccess();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Google sign-in failed",
              );
            }
          })();
        },
      });
      window.google?.accounts.id.prompt();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }, [onSuccess, socialLogin]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!provider) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await socialLogin({
        provider,
        name,
        email,
        phone,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Social sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => {
            void continueWithGoogle();
          }}
        >
          Continue with Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<FacebookIcon />}
          onClick={() => {
            setProvider("facebook");
          }}
        >
          Continue with Facebook
        </Button>
      </Stack>

      <Dialog open={Boolean(provider)} onClose={close} fullWidth maxWidth="xs">
        <DialogTitle>
          {mode === "login" ? "Continue" : "Create account"} with{" "}
          {provider ? providerLabel[provider] : ""}
        </DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="social-auth-form"
            gap={2}
            mt={1}
            onSubmit={(event) => {
              void submit(event);
            }}
          >
            <Typography variant="body2" color="text.secondary">
              OAuth credentials are not configured locally yet, so this
              development flow uses your email to create or find the social
              account.
            </Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Full name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
            <TextField
              required
              label="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
            <TextField
              label="Phone"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            form="social-auth-form"
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Please wait..." : "Continue"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SocialAuthPanel;
