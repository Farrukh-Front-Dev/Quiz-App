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
  grade?: Grade;
  subject?: Subject;
  options: Option[];
}

// --- STATE ---
interface QuestionsState {
  items: Question[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: QuestionsState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
};

// --- THUNKS ---

export const fetchQuestions = createAsyncThunk<
  { data: Question[]; total: number },
  { subject?: string; grade?: string; page?: number; limit?: number } | undefined
>("questions/fetch", async (filters) => {
  const params: Record<string, string | number> = {
    page: filters?.page || 1,
    limit: filters?.limit || 20,
  };

  // ✅ To‘g‘rilangan joy
  if (filters?.subject) params.subject = filters.subject;
  if (filters?.grade) params.grade = filters.grade;

  const res = await api.get("/subjects/with-test", { params });

  const responseData = res.data?.data;

  return {
    data: (responseData?.items || []).map((item: any) => ({
      id: item.id,
      question: item.question,
      options: item.options || [],
      grade: item.grade
        ? { id: item.grade.id, title: item.grade.title }
        : undefined,
      subject: item.grade?.subject
        ? {
            id: item.grade.subject.id,
            title: item.grade.subject.title,
            grades: [],
          }
        : undefined,
    })),
    total: responseData?.total || 0,
  };
});


// 🔹 Yangi savol qo‘shish
export const createQuestion = createAsyncThunk<
  Question,
  {
    question: string;
    subjectId: string;
    gradeId: string;
    options: { variant: string; is_correct: boolean }[];
  }
>("questions/create", async (payload) => {
  const res = await api.post("/questions", payload);
  return res.data.data as Question;
});

// 🔹 Savolni yangilash
export const updateQuestion = createAsyncThunk<
  Question,
  {
    id: string;
    question: string;
    subjectId: string;
    gradeId: string;
    options: { id?: string; variant: string; is_correct: boolean }[];
  }
>("questions/update", async ({ id, ...payload }) => {
  const res = await api.put(`/questions/${id}`, payload);
  return res.data.data as Question;
});

// 🔹 Savolni o‘chirish
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
      // FETCH
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchQuestions.fulfilled,
        (state, action: PayloadAction<{ data: Question[]; total: number }>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.total = action.payload.total;
        }
      )
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Savollarni yuklashda xatolik!";
      })

      // CREATE
      .addCase(
        createQuestion.fulfilled,
        (state, action: PayloadAction<Question>) => {
          state.items.push(action.payload);
          state.total += 1;
        }
      )

      // UPDATE
      .addCase(
        updateQuestion.fulfilled,
        (state, action: PayloadAction<Question>) => {
          const idx = state.items.findIndex((q) => q.id === action.payload.id);
          if (idx !== -1) state.items[idx] = action.payload;
        }
      )

      // DELETE
      .addCase(
        deleteQuestion.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter((q) => q.id !== action.payload);
          state.total -= 1;
        }
      );
  },
});

export default questionsSlice.reducer;
