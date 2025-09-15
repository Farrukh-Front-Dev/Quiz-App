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
>("questions/fetch", async (filters = {}) => {
  const params: any = {};
  if (filters?.subjectId) params.subject_id = filters.subjectId;
  if (filters?.gradeId) params.grade_id = filters.gradeId;
  
  const res = await api.get("/questions", { params });
  return res.data.data as Question[];
});

export const createQuestion = createAsyncThunk<Question, {
  question: string;
  subjectId: string;
  gradeId: string;
  options: { variant: string; is_correct: boolean }[];
}>("questions/create", async (payload) => {
  // Transform payload to match backend expectations
  const transformedPayload = {
    question: payload.question,
    subject_id: payload.subjectId,
    grade_id: payload.gradeId,
    options: payload.options,
  };
  
  const res = await api.post("/questions", transformedPayload);
  return res.data.data as Question;
});

export const updateQuestion = createAsyncThunk<Question, {
  id: string;
  question: string;
  subjectId: string;
  gradeId: string;
  options: { id?: string; variant: string; is_correct: boolean }[];
}>("questions/update", async ({ id, ...payload }) => {
  // Transform payload to match backend expectations
  const transformedPayload = {
    question: payload.question,
    subject_id: payload.subjectId,
    grade_id: payload.gradeId,
    options: payload.options,
  };
  
  const res = await api.put(`/questions/${id}`, transformedPayload);
  return res.data.data as Question;
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
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearQuestions: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Questions
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
      
      // Create Question
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Savol qo'shishda xatolik!";
      })
      
      // Update Question
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        state.loading = false;
        const idx = state.items.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Savol yangilashda xatolik!";
      })
      
      // Delete Question
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((q) => q.id !== action.payload);
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Savol o'chirishda xatolik!";
      });
  },
});

export const { clearError, clearQuestions } = questionsSlice.actions;
export default questionsSlice.reducer;