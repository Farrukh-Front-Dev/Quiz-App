import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface Option {
  id: string;
  variant: string;
  is_correct: boolean;
  question_id?: string;
}

interface OptionsState {
  items: Option[];
  loading: boolean;
  error: string | null;
}

const initialState: OptionsState = {
  items: [],
  loading: false,
  error: null,
};

export const createOption = createAsyncThunk<
  Option,
  { questionId: string; variant: string; is_correct: boolean }
>("options/create", async (payload, { rejectWithValue }) => {
  try {
    console.log("📤 Creating option:", payload);
    const res = await api.post("/options", {
      questionId: payload.questionId,
      variant: payload.variant,
      is_correct: payload.is_correct,
    });
    console.log("✅ Option created:", res.data);
    return res.data.data as Option;
  } catch (error: any) {
    console.error("❌ createOption error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data);
  }
});

export const updateOption = createAsyncThunk<
  Option,
  { id: string; variant: string; is_correct: boolean }
>("options/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    console.log("📤 Updating option:", { id, ...payload });
    const res = await api.put(`/options/${id}`, payload);
    console.log("✅ Option updated:", res.data);
    return res.data.data as Option;
  } catch (error: any) {
    console.error("❌ updateOption error:", error.response?.data);
    return rejectWithValue(error.response?.data);
  }
});

export const deleteOption = createAsyncThunk<string, string>(
  "options/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/options/${id}`);
      return id;
    } catch (error: any) {
      console.error("❌ deleteOption error:", error.response?.data);
      return rejectWithValue(error.response?.data);
    }
  }
);

const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOption.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateOption.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteOption.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload);
      });
  },
});

export default optionsSlice.reducer;