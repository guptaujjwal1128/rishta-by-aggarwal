import {
  createContext,
  useCallback,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearStoredToken,
  getMe,
  getStoredToken,
  login as loginRequest,
  register as registerRequest,
  setStoredToken,
  socialLogin as socialLoginRequest,
} from "../services/api";
import type { User } from "../types/domain";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: { identifier: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  socialLogin: (payload: {
    provider: "google" | "facebook";
    name?: string;
    email?: string;
    phone?: string;
    credential?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(Boolean(initialToken));

  useEffect(() => {
    if (!initialToken) {
      return;
    }

    void getMe()
      .then(({ user: currentUser }) => {
        setUser(currentUser);
      })
      .catch(() => {
        clearStoredToken();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initialToken]);

  const completeAuth = useCallback((token: string, currentUser: User) => {
    setStoredToken(token);
    setUser(currentUser);
  }, []);

  const login = useCallback(
    async (payload: { identifier: string; password: string }) => {
      const response = await loginRequest(payload);
      completeAuth(response.token, response.user);
    },
    [completeAuth],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const response = await registerRequest(payload);
      completeAuth(response.token, response.user);
    },
    [completeAuth],
  );

  const socialLogin = useCallback(
    async (payload: {
      provider: "google" | "facebook";
      name?: string;
      email?: string;
      phone?: string;
      credential?: string;
    }) => {
      const response = await socialLoginRequest(payload);
      completeAuth(response.token, response.user);
    },
    [completeAuth],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      socialLogin,
      logout,
    }),
    [loading, login, logout, register, socialLogin, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
