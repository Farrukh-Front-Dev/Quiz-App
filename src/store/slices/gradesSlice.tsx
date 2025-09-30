import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface Subject {
  id: string;
  title: string;
}

export interface Grade {
  id: string;
  title: string;
  subject: Subject;
  is_active: boolean;
}

interface GradeState {
  items: Grade[];
  loading: boolean;
  error: string | null;
}

const initialState: GradeState = {
  items: [],
  loading: false,
  error: null,
};

// 🔹 Grades olish
export const fetchGrades = createAsyncThunk("grades/fetch", async () => {
  const res = await api.get("/grades");
  return res.data.data as Grade[];
});

// 🔹 Grade qo‘shish
// 🔹 Grade qo‘shish
export const createGrade = createAsyncThunk(
  "grades/create",
  async (payload: { title: string; subjectId: string }) => {
    console.log("📤 createGrade payload:", payload);

    const res = await api.post("/grades", {
      title: payload.title,
      subjectId: payload.subjectId,  // ✅ backend kutyapti shu formatni
    });

    console.log("📥 createGrade response:", res.data);
    return res.data.data as Grade;
  }
);

// 🔹 Grade yangilash
export const updateGrade = createAsyncThunk(
  "grades/update",
  async (payload: { id: string; title: string; subjectId: string }) => {
    const res = await api.put(`/grades/${payload.id}`, {
      title: payload.title,
      subjectId: payload.subjectId,  // ✅ faqat ID yuboramiz
    });

    return res.data.data as Grade;
  }
);


// 🔹 Grade o‘chirish
export const deleteGrade = createAsyncThunk(
  "grades/delete",
  async (id: string) => {
    await api.delete(`/grades/${id}`);
    return id;
  }
);

const gradesSlice = createSlice({
  name: "grades",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrades.fulfilled, (state, action: PayloadAction<Grade[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Grades yuklanmadi!";
      })
      .addCase(createGrade.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.items.push(action.payload);
      })
      .addCase(updateGrade.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.items = state.items.map((g) =>
          g.id === action.payload.id ? action.payload : g
        );
      })
      .addCase(deleteGrade.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      });
  },
});

export default gradesSlice.reducer;
