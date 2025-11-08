import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export type Role = "user" | "admin" | "super-admin";

export interface User {
  id: string;
  name?: string;
  surname?: string;
  phone?: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }

      
      api.defaults.headers.common.Authorization = `Bearer ${action.payload.token}`;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      // 🔑 API headerdan ham tokenni o'chiramiz
      delete api.defaults.headers.common.Authorization;
    },
    loadFromStorage: (state) => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          state.token = token;
          state.user = user;

          // 🔑 API headerga tokenni qayta qo'yamiz
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } catch {
          state.token = null;
          state.user = null;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      state.loading = false;
    },
  },
});

export const { setCredentials, logout, loadFromStorage } = authSlice.actions;
export default authSlice.reducer;
