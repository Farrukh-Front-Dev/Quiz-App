// src/store/slices/userRouteSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// 🔹 Quiz savollarini fetch qilish thunk
export const fetchQuizQuestions = createAsyncThunk<
  any, // agar kerak bo‘lsa keyin interface bilan o‘zgartiramiz
  { subject: string; grade: string; page?: number; limit?: number }
>(
  "userRoute/fetchQuizQuestions",
  async ({ subject, grade, page = 1, limit = 10 }) => {
    const res = await api.get(
      `/subjects/with-test?page=${page}&limit=${limit}&subject=${encodeURIComponent(
        subject
      )}&grade=${encodeURIComponent(grade)}`
    );
    return res.data.data; // total, items, etc.
  }
);

// 🔹 Slice interfeysi
interface UserRouteState {
  questions: any[]; // keyin interface bilan aniqlashtirish mumkin
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: UserRouteState = {
  questions: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

// 🔹 Slice
const userRouteSlice = createSlice({
  name: "userRoute",
  initialState,
  reducers: {
    clearQuestions(state) {
      state.questions = [];
      state.error = null;
      state.loading = false;
      state.total = 0;
      state.page = 1;
      state.totalPages = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchQuizQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Savollarni olishda xatolik!";
      });
  },
});

export const { clearQuestions } = userRouteSlice.actions;
export default userRouteSlice.reducer;
