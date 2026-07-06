import {
  createContext,
  useCallback,
  useContext,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
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
  }, []);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
