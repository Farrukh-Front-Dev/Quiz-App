import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  loading: boolean; // 👈 Yangi field
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true, // 👈 Avval true, sahifa ochilganda storage’dan yuklaymiz
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
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
        } catch {
          state.token = null;
          state.user = null;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      state.loading = false; // 👈 Muhim: yuklash tugadi
    },
  },
});

export const { setCredentials, logout, loadFromStorage } = authSlice.actions;
export default authSlice.reducer;
