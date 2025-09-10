import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface Question {
  id: string;
  question: string;
}

export interface Subject {
  id: string;
  title: string;
}

export interface Grade {
  id: string;
  title: string;
  subject: Subject;
  questions: Question[];
  created_by: string; // 🔹 owner user id
}

interface GradesState {
  items: Grade[];
  selectedGrade: Grade | null;
  loading: boolean;
  error: string | null;
}

const initialState: GradesState = {
  items: [],
  selectedGrade: null,
  loading: false,
  error: null,
};

// Async Thunks
export const loadGrades = createAsyncThunk<Grade[], void, { state: any }>(
  "grades/loadGrades",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/grades");
      // 🔹 created_by qo‘shish
      const grades: Grade[] = res.data.data.map((g: any) => ({
        ...g,
        created_by: g.created_by || g.user?.id || "unknown",
      }));
      return grades;
    } catch (err: any) {
      return rejectWithValue(err.message || "Grades fetch failed");
    }
  }
);

export const loadGradeById = createAsyncThunk<Grade, string, { state: any }>(
  "grades/loadGradeById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/grades/${id}`);
      const grade: Grade = {
        ...res.data.data,
        created_by: res.data.data.created_by || res.data.data.user?.id || "unknown",
      };
      return grade;
    } catch (err: any) {
      return rejectWithValue(err.message || "Grade fetch failed");
    }
  }
);

export const gradesSlice = createSlice({
  name: "grades",
  initialState,
  reducers: {
    clearSelectedGrade: (state) => {
      state.selectedGrade = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load all grades
      .addCase(loadGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGrades.fulfilled, (state, action: PayloadAction<Grade[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load single grade
      .addCase(loadGradeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGradeById.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.loading = false;
        state.selectedGrade = action.payload;
      })
      .addCase(loadGradeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedGrade } = gradesSlice.actions;
export default gradesSlice.reducer;
