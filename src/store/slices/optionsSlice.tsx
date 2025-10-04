import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// --- TYPES ---
export interface Option {
  id: string;
  variant: string;
  is_correct: boolean;
  question?: {
    id: string;
    question: string;
  };
  question_id?: string;
}

// --- STATE ---
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

// --- THUNKS ---

// 🔹 Barcha optionsni olish (ixtiyoriy questionId bilan)
export const fetchOptions = createAsyncThunk<
  Option[],
  { questionId?: string } | void
>("options/fetchAll", async (params) => {
  const res = await api.get("/options", { params });
  return res.data.data as Option[];
});

// 🔹 Bitta optionni olish
export const fetchOptionById = createAsyncThunk<Option, string>(
  "options/fetchOne",
  async (id) => {
    const res = await api.get(`/options/${id}`);
    return res.data.data as Option;
  }
);

// 🔹 Yangi option yaratish
// 🔹 Yangi option yaratish
export const createOption = createAsyncThunk<
  Option,
  { question_id: string; variant: string; is_correct: boolean }
>("options/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/options", {
      questionId: payload.question_id, // ✅ backend `questionId` kutyapti
      variant: payload.variant,
      is_correct: payload.is_correct,
    });
    return res.data.data as Option;
  } catch (error: any) {
    console.error("❌ Option yaratishda xatolik:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data);
  }
});


// 🔹 Optionni yangilash
export const updateOption = createAsyncThunk<
  Option,
  { id: string; variant: string; is_correct: boolean }
>("options/update", async ({ id, ...payload }) => {
  const res = await api.put(`/options/${id}`, payload);
  return res.data.data as Option;
});

// 🔹 Optionni o‘chirish
export const deleteOption = createAsyncThunk<string, string>(
  "options/delete",
  async (id) => {
    await api.delete(`/options/${id}`);
    return id;
  }
);

// --- SLICE ---
const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch all ---
      .addCase(fetchOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOptions.fulfilled,
        (state, action: PayloadAction<Option[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Optionsni yuklashda xatolik!";
      })

      // --- Fetch by id ---
      .addCase(
        fetchOptionById.fulfilled,
        (state, action: PayloadAction<Option>) => {
          const idx = state.items.findIndex((o) => o.id === action.payload.id);
          if (idx === -1) {
            state.items.push(action.payload);
          } else {
            state.items[idx] = action.payload;
          }
        }
      )

      // --- Create ---
      .addCase(
        createOption.fulfilled,
        (state, action: PayloadAction<Option>) => {
          state.items.push(action.payload);
        }
      )

      // --- Update ---
      .addCase(
        updateOption.fulfilled,
        (state, action: PayloadAction<Option>) => {
          const idx = state.items.findIndex((o) => o.id === action.payload.id);
          if (idx !== -1) state.items[idx] = action.payload;
        }
      )

      // --- Delete ---
      .addCase(
        deleteOption.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter((o) => o.id !== action.payload);
        }
      );
  },
});

export default optionsSlice.reducer;
