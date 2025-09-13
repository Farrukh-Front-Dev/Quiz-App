import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

// --- THUNKS ---
export const loadSubjects = createAsyncThunk<Subject[]>(
  "subjects/load",
  async () => {
    const res = await api.get("/subjects");
    return res.data.data;
  }
);

export const addSubject = createAsyncThunk<Subject, { title: string }>(
  "subjects/add",
  async ({ title }) => {
    const res = await api.post("/subjects", { title });
    return res.data; // yangi subject qaytadi
  }
);

export const editSubject = createAsyncThunk<Subject, { id: string; title: string }>(
  "subjects/edit",
  async ({ id, title }) => {
    const res = await api.put(`/subjects/${id}`, { title });
    return res.data;
  }
);

export const removeSubject = createAsyncThunk<string, string>(
  "subjects/remove",
  async (id) => {
    await api.delete(`/subjects/${id}`);
    return id;
  }
);

// --- SLICE ---
const subjectsSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadSubjects.fulfilled, (state, action) => {
        state.loading = false;
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
      });
  },
});

export default subjectsSlice.reducer;
