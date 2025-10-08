import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface Option {
  id: string;
  variant: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: Option[];
  selectedOptionId?: string | null;
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

// --- FETCH ONE RESULT BY ID ---
export const fetchResultById = createAsyncThunk<Result, string>(
  "results/fetchById",
  async (id) => {
    console.log("📡 Fetching result by ID:", id);

    const res = await api.get(`/results/${id}`);
    const data = res.data?.data;

    console.log("📥 Raw response from API:", data);

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
        question: q.question.question,
        options: q.question.options.map((o: any) => ({
          id: o.id,
          variant: o.variant,
          is_correct: o.is_correct,
        })),
        selectedOptionId: q.selectedOption?.id || null,
      })),
    };
  }
);

const resultSlice = createSlice({
  name: "result",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchResultById.fulfilled,
        (state, action: PayloadAction<Result>) => {
          state.loading = false;
          state.item = action.payload;
        }
      )
      .addCase(fetchResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Natijani yuklashda xatolik!";
      });
  },
});

export default resultSlice.reducer;
