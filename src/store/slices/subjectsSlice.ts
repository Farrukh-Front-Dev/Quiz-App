import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface Grade {
  id: string;
  title: string;
}

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

// --- Async Thunks --- //
export const loadSubjects = createAsyncThunk<
  Subject[],
  void,
  { rejectValue: string }
>("subjects/load", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/subjects");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fanlarni yuklashda xatolik!");
  }
});

export const addSubject = createAsyncThunk<
  Subject,
  { title: string },
  { rejectValue: string }
>("subjects/add", async ({ title }, { rejectWithValue }) => {
  try {
    const res = await api.post("/subjects", { title });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fan qo'shishda xatolik!");
  }
});

export const editSubject = createAsyncThunk<
  Subject,
  { id: string; title: string },
  { rejectValue: string }
>("subjects/edit", async ({ id, title }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/subjects/${id}`, { title });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fan tahrirlashda xatolik!");
  }
});

export const removeSubject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("subjects/remove", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/subjects/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fan o'chirishda xatolik!");
  }
});

// --- SLICE --- //
const subjectsSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- LOAD SUBJECTS --- //
      .addCase(loadSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSubjects.fulfilled, (state, action: PayloadAction<Subject[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fanlarni yuklashda xatolik!";
      })

      // --- ADD SUBJECT --- //
      .addCase(addSubject.fulfilled, (state, action: PayloadAction<Subject>) => {
        state.items.push(action.payload);
      })
      .addCase(addSubject.rejected, (state, action) => {
        state.error = action.payload || "Fan qo'shishda xatolik!";
      })

      // --- EDIT SUBJECT --- //
      .addCase(editSubject.fulfilled, (state, action: PayloadAction<Subject>) => {
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(editSubject.rejected, (state, action) => {
        state.error = action.payload || "Fan tahrirlashda xatolik!";
      })

      // --- REMOVE SUBJECT --- //
      .addCase(removeSubject.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      })
      .addCase(removeSubject.rejected, (state, action) => {
        state.error = action.payload || "Fan o'chirishda xatolik!";
      });
  },
});

export default subjectsSlice.reducer;
