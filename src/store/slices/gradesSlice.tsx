import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ====== TYPES ======
export interface Subject {
  id: string;
  title: string;
}

export interface Grade {
  id: string;
  title: string;
  time: number; // ⏱️ Test vaqti (daqiqada)
  questionCount: number; // ❓ Savollar soni
  subject: Subject;
  is_active: boolean;
}

interface GradeState {
  items: Grade[];
  loading: boolean;
  error: string | null;
}

// ====== INITIAL STATE ======
const initialState: GradeState = {
  items: [],
  loading: false,
  error: null,
};

// ====== ASYNC THUNKS ======

// 🔹 Grade qo‘shish
export const createGrade = createAsyncThunk(
  "grades/create",
  async (payload: { title: string; subjectId: string; time: number; questionCount: number }) => {
    const res = await api.post("/grades", {
      title: payload.title,
      subjectId: payload.subjectId,
      time: payload.time,
      questionCount: payload.questionCount,
    });
    return res.data.data as Grade;
  }
);

// 🔹 Grade yangilash
export const updateGrade = createAsyncThunk(
  "grades/update",
  async (payload: { id: string; title: string; subjectId: string; time: number; questionCount: number }) => {
    const res = await api.put(`/grades/${payload.id}`, {
      title: payload.title,
      subjectId: payload.subjectId,
      time: payload.time,
      questionCount: payload.questionCount,
    });
    return res.data.data as Grade;
  }
);

// 🔹 Grade o‘chirish
export const deleteGrade = createAsyncThunk("grades/delete", async (id: string) => {
  await api.delete(`/grades/${id}`);
  return id;
});

// ====== SLICE ======
const gradesSlice = createSlice({
  name: "grades",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔸 Qo‘shish
      .addCase(createGrade.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.items.push(action.payload);
      })
      // 🔸 Yangilash
      .addCase(updateGrade.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.items = state.items.map((g) =>
          g.id === action.payload.id ? action.payload : g
        );
      })
      // 🔸 O‘chirish
      .addCase(deleteGrade.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      })
      // 🔸 Loading/Error holatlari
      .addMatcher(
        (action) => action.type.startsWith("grades/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("grades/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("grades/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.error?.message || "Xatolik yuz berdi";
        }
      );
  },
});

export default gradesSlice.reducer;
