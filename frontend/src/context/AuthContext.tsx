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
import { useAppDispatch, useAppSelector } from "../store";
import { api } from "../store/api";
import {
  authCleared,
  authFinished,
  authStarted,
  authSucceeded,
} from "../store/authSlice";

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
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [initialToken] = useState(getStoredToken);

  useEffect(() => {
    if (!initialToken) {
      return;
    }

    void getMe()
      .then(({ user: currentUser }) => {
        dispatch(authSucceeded(currentUser));
      })
      .catch(() => {
        clearStoredToken();
        dispatch(api.util.resetApiState());
        dispatch(authCleared());
      });
  }, [dispatch, initialToken]);

  const completeAuth = useCallback(
    (token: string, currentUser: User) => {
      setStoredToken(token);
      dispatch(api.util.resetApiState());
      dispatch(authSucceeded(currentUser));
    },
    [dispatch],
  );

  const login = useCallback(
    async (payload: { identifier: string; password: string }) => {
      dispatch(authStarted());
      try {
        const response = await loginRequest(payload);
        completeAuth(response.token, response.user);
      } catch (error) {
        dispatch(authFinished());
        throw error;
      }
    },
    [completeAuth, dispatch],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      dispatch(authStarted());
      try {
        const response = await registerRequest(payload);
        completeAuth(response.token, response.user);
      } catch (error) {
        dispatch(authFinished());
        throw error;
      }
    },
    [completeAuth, dispatch],
  );

  const socialLogin = useCallback(
    async (payload: {
      provider: "google" | "facebook";
      name?: string;
      email?: string;
      phone?: string;
      credential?: string;
    }) => {
      dispatch(authStarted());
      try {
        const response = await socialLoginRequest(payload);
        completeAuth(response.token, response.user);
      } catch (error) {
        dispatch(authFinished());
        throw error;
      }
    },
    [completeAuth, dispatch],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    dispatch(api.util.resetApiState());
    dispatch(authCleared());
  }, [dispatch]);

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
