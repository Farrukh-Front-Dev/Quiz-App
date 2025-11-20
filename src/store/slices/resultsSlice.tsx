// src/store/slices/resultsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ====== INTERFACES ======
export interface Option {
  id: string;
  variant: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  question: string | { question: string };
  options: Option[];
}

export interface Result {
  id: string;
  result: number;
  time: number;
  status: string;
  subject: { id: string; title: string };
  grade: { id: string; title: string };
  user: { id: string; name: string; surname: string };
  questions: Question[];
}

interface ResultState {
  item: Result | null;
  loading: boolean;
  error: string | null;
}

const initialState: ResultState = {
  item: null,
  loading: false,
  error: null,
};

// ====== THUNKS ======

// 1️⃣ Testni boshlash (POST /results)
// ❗ Faqat gradeId yuboriladi – subjectId olib tashlandi
export const createResult = createAsyncThunk<
  Result,
  { gradeId: string }
>("results/create", async ({ gradeId }) => {
  const res = await api.post("/results", { gradeId });
  return res.data.data as Result;
});

// 2️⃣ Result (savollar bilan) olish (GET /results/{id})
export const fetchResultById = createAsyncThunk<Result, string>(
  "results/fetchById",
  async (id) => {
    const res = await api.get(`/results/${id}`);
    const data = res.data.data;

    return {
      id: data.id,
      result: data.result,
      time: data.time,
      status: data.status,
      subject: { id: data.subject.id, title: data.subject.title },
      grade: { id: data.grade.id, title: data.grade.title },
      user: {
        id: data.user.id,
        name: data.user.name,
        surname: data.user.surname,
      },

      questions: data.questions.map((q: any) => ({
        id: q.id,
        question:
          typeof q.question === "string"
            ? q.question
            : q.question?.question || "No question text",
        options: (q.question?.options || []).map((o: any) => ({
          id: o.id,
          variant: o.variant,
          is_correct: o.is_correct,
        })),
        selectedOptionId: q.selectedOption?.id || null,
      })),
    } as Result;
  }
);

// 3️⃣ Testni yakunlash (POST /results/{id}/finish)
export const finishResult = createAsyncThunk<
  Result,
  { id: string; answers: Record<string, string> }
>("results/finish", async ({ id, answers }) => {
  const res = await api.post(`/results/${id}/finish`, { answers });
  return res.data.data as Result;
});

// ====== SLICE ======
const resultsSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    clearResult(state) {
      state.item = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // CREATE RESULT
    builder
      .addCase(createResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResult.fulfilled, (state, action: PayloadAction<Result>) => {
        state.loading = false;
        state.item = action.payload;
      })
      .addCase(createResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Testni boshlashda xatolik!";
      });

    // FETCH BY ID
    builder
      .addCase(fetchResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultById.fulfilled, (state, action: PayloadAction<Result>) => {
        state.loading = false;
        state.item = action.payload;
      })
      .addCase(fetchResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Savollarni yuklashda xatolik!";
      });

    // FINISH RESULT
    builder
      .addCase(finishResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finishResult.fulfilled, (state, action: PayloadAction<Result>) => {
        state.loading = false;
        state.item = action.payload;
      })
      .addCase(finishResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Natijani yakunlashda xatolik!";
      });
  },
});

export const { clearResult } = resultsSlice.actions;
export default resultsSlice.reducer;
