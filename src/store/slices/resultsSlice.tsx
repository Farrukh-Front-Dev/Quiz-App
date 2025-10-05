import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface Result {
  id: string;
  result: number;
  time: number;
  status: string;
  grade: { id: string; title: string; questionCount: number };
  subject: { id: string; title: string };
}

interface ResultsState {
  items: Result[];
  loading: boolean;
  error: string | null;
}

const initialState: ResultsState = {
  items: [],
  loading: false,
  error: null,
};

// 🔹 User natijalarini yuklash thunk
export const fetchUserResults = createAsyncThunk<Result[], string>(
  "results/fetchUser",
  async (userId) => {
    const res = await api.get(`/results?userId=${userId}`);
    return res.data.data as Result[];
  }
);

const resultsSlice = createSlice({
  name: "results",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserResults.fulfilled, (state, action: PayloadAction<Result[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Natijalarni yuklashda xatolik!";
      });
  },
});

export default resultsSlice.reducer;
