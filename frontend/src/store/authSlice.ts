import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { getStoredToken } from "../services/api";
import type { User } from "../types/domain";

interface AuthState {
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: Boolean(getStoredToken()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStarted(state) {
      state.loading = true;
    },
    authFinished(state) {
      state.loading = false;
    },
    authSucceeded(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
    },
    authCleared(state) {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { authStarted, authFinished, authSucceeded, authCleared } =
  authSlice.actions;
export default authSlice.reducer;
