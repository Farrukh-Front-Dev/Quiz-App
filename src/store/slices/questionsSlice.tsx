import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// --- TYPES ---
export interface Option {
  id?: string;
  variant: string;
  is_correct: boolean;
}

export interface Grade {
  id: string;
  title: string;
}

export interface Subject {
  id: string;
  title: string;
  grades: Grade[];
}

export interface Question {
  id: string;
  question: string;
  grade: Grade;
  subject: Subject;
  options: Option[];
}

// --- STATE ---
interface QuestionsState {
  items: Question[];
  loading: boolean;
  error: string | null;
}

const initialState: QuestionsState = {
  items: [],
  loading: false,
  error: null,
};

// --- THUNKS ---
export const fetchQuestions = createAsyncThunk<
  Question[],
  { subjectId?: string; gradeId?: string } | undefined
>("questions/fetch", async (filters) => {
  const params: any = {};
  if (filters?.subjectId) params.subjectId = filters.subjectId;
  if (filters?.gradeId) params.gradeId = filters.gradeId;
  const res = await api.get("/questions", { params });
  return res.data.data;
});

export const createQuestion = createAsyncThunk<Question, {
  question: string;
  subjectId: string;
  gradeId: string;
  options: { variant: string; is_correct: boolean }[];
}>("questions/create", async (payload) => {
  const res = await api.post("/questions", payload);
  return res.data.data;
});

export const updateQuestion = createAsyncThunk<Question, {
  id: string;
  question: string;
  subjectId: string;
  gradeId: string;
  options: { id?: string; variant: string; is_correct: boolean }[];
}>("questions/update", async ({ id, ...payload }) => {
  const res = await api.put(`/questions/${id}`, payload);
  return res.data.data;
});

export const deleteQuestion = createAsyncThunk<string, string>(
  "questions/delete",
  async (id) => {
    await api.delete(`/questions/${id}`);
    return id;
  }
);

// --- SLICE ---
const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<Question[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Savollarni yuklashda xatolik!";
      })
      .addCase(createQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        state.items.push(action.payload);
      })
      .addCase(updateQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        const idx = state.items.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((q) => q.id !== action.payload);
      });
  },
});

export default questionsSlice.reducer;