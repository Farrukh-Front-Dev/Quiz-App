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
  total: number;
  page: number;
  limit: number;
}

const initialState: SubjectsState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

// ================= API THUNK =================

// 🔹 Fan va grade’larni testlar bilan olish (pagination bilan)
export const loadSubjectsWithGrades = createAsyncThunk<
  { items: Subject[]; total: number; page: number },
  { page?: number; limit?: number },
  { state: { subjects: SubjectsState } }
>("subjects/loadWithGrades", async ({ page = 1, limit = 10 }) => {
  const res = await api.get(`/subjects/with-test?page=${page}&limit=${limit}`);
  const data = res.data.data;

  const items = data.items;
  const subjectsMap: Record<string, Subject> = {};

  items.forEach((item: any) => {
    const grade = item.grade;
    const subject = grade.subject;

    if (!subjectsMap[subject.id]) {
      subjectsMap[subject.id] = {
        id: subject.id,
        title: subject.title,
        grades: [],
      };
    }

    if (!subjectsMap[subject.id].grades.some((g) => g.id === grade.id)) {
      subjectsMap[subject.id].grades.push({
        id: grade.id,
        title: grade.title,
        time: grade.time,
        questionCount: grade.questionCount,
        subject: subject,
        is_active: grade.is_active ?? true,
      });
    }
  });

  return {
    items: Object.values(subjectsMap),
    total: data.total,
    page,
  };
});

// 🔹 Eski barcha fanlarni yuklash (grades ham ichida keladi)
export const loadSubjects = createAsyncThunk<Subject[]>(
  "subjects/load",
  async () => {
    const res = await api.get("/subjects");
    return res.data.data as Subject[];
  }
);

// 🔹 Qidiruv
// 🔹 Qidiruv (fan nomi bo‘yicha)
export const searchSubjectsByTitle = createAsyncThunk<
  Subject[],
  string,
  { rejectValue: string }
>("subjects/search", async (query, { rejectWithValue }) => {
  try {
    if (!query.trim()) return []; // Bo‘sh qidiruvni bekor qilish

    const res = await api.get(`/subjects/title/${encodeURIComponent(query)}`);

    // API formatga mos ma’lumot
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data as Subject[];
    } else {
      return rejectWithValue("Kutilmagan javob formati!");
    }
  } catch (error: any) {
    console.error("❌ Qidiruvda xatolik:", error);
    return rejectWithValue(
      error.response?.data?.message || "Qidiruvda xatolik yuz berdi!"
    );
  }
});


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
  reducers: {
    clearSubjects(state) {
      state.items = [];
      state.page = 1;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ====== YANGI API (pagination bilan) ======
      .addCase(loadSubjectsWithGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSubjectsWithGrades.fulfilled, (state, action) => {
        state.loading = false;

        // Agar bu 1-sahifa bo‘lsa — yangidan yozamiz, aks holda ustiga qo‘shamiz
        if (action.payload.page === 1) {
          state.items = action.payload.items;
        } else {
          const newSubjects = action.payload.items.filter(
            (s) => !state.items.some((old) => old.id === s.id)
          );
          state.items = [...state.items, ...newSubjects];
        }

        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(loadSubjectsWithGrades.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Fanlar va darajalarni yuklashda xatolik!";
      })

      // ====== ESKI CRUD ======
      .addCase(loadSubjects.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(searchSubjectsByTitle.fulfilled, (state, action) => {
        state.items = action.payload;
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

      // ====== GRADE CRUD (subjects bilan bog‘langan) ======
      .addCase(createGrade.fulfilled, (state, action) => {
        const grade = action.payload;
        const subject = state.items.find((s) => s.id === grade.subject.id);
        if (subject) subject.grades.push(grade);
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

export const { clearSubjects } = subjectsSlice.actions;
export default subjectsSlice.reducer;
