import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  createGrade,
  updateGrade,
  deleteGrade,
  Grade,
} from "@/store/slices/gradesSlice";

// 🔹 Subject interfeysi
export interface Subject {
  id: string;
  title: string;
  grades: Grade[];
}

interface SubjectsState {
  items: Subject[];
  loading: boolean;
  error: string | null;
}

const initialState: SubjectsState = {
  items: [],
  loading: false,
  error: null,
};

// ================= API THUNK =================

// 🔹 Barcha fanlarni yuklash (grades ham ichida keladi)
export const loadSubjects = createAsyncThunk<Subject[]>(
  "subjects/load",
  async () => {
    const res = await api.get("/subjects");
    return res.data.data as Subject[];
  }
);

// 🔹 Qidiruv
export const searchSubjectsByTitle = createAsyncThunk<Subject[], string>(
  "subjects/search",
  async (query) => {
    const res = await api.get(`/subjects/title/${encodeURIComponent(query)}`);
    return res.data.data as Subject[];
  }
);

// 🔹 Fan qo‘shish
export const addSubject = createAsyncThunk<Subject, { title: string }>(
  "subjects/add",
  async ({ title }) => {
    const res = await api.post("/subjects", { title });
    return res.data.data as Subject;
  }
);

// 🔹 Fan tahrirlash
export const editSubject = createAsyncThunk<
  Subject,
  { id: string; title: string }
>("subjects/edit", async ({ id, title }) => {
  const res = await api.put(`/subjects/${id}`, { title });
  return res.data.data as Subject;
});

// 🔹 Fan o‘chirish
export const removeSubject = createAsyncThunk<string, string>(
  "subjects/remove",
  async (id) => {
    await api.delete(`/subjects/${id}`);
    return id;
  }
);

// ================= SLICE =================

const subjectsSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== SUBJECT CRUD =====
      .addCase(loadSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Fanlarni yuklashda xatolik!";
      })

      .addCase(searchSubjectsByTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSubjectsByTitle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(searchSubjectsByTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Qidiruvda xatolik!";
      })

      .addCase(addSubject.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(editSubject.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(removeSubject.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      })

      // ===== GRADE CRUD (subjects bilan bog‘langan) =====
      .addCase(createGrade.fulfilled, (state, action) => {
        const grade = action.payload;
        const subject = state.items.find((s) => s.id === grade.subject.id);
        if (subject) {
          subject.grades.push(grade);
        }
      })
      .addCase(updateGrade.fulfilled, (state, action) => {
        const grade = action.payload;
        const subject = state.items.find((s) => s.id === grade.subject.id);
        if (subject) {
          const idx = subject.grades.findIndex((g) => g.id === grade.id);
          if (idx !== -1) subject.grades[idx] = grade;
        }
      })
      .addCase(deleteGrade.fulfilled, (state, action: PayloadAction<string>) => {
        state.items.forEach((subject) => {
          subject.grades = subject.grades.filter((g) => g.id !== action.payload);
        });
      });
  },
});

export default subjectsSlice.reducer;
