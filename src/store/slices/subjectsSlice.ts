import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { RootState } from "@/store";

export interface Grade {
  id: string;
  title: string;
}

export interface Subject {
  id: string;
  title: string;
  grades: Grade[];
  created_by: string | null; // owner user id
}

export interface SubjectsState {
  items: Subject[];
  loading: boolean;
  error: string | null;
}

export const loadSubjects = createAsyncThunk<Subject[]>(
  "subjects/load",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/subjects");
      // Agar serverda created_by null bo'lsa, default "unknown"
      const subjectsWithOwner: Subject[] = res.data.data.map((sub: any) => ({
        ...sub,
        created_by: sub.created_by || sub.user?.id || null,
      }));
      return subjectsWithOwner;
    } catch (err: any) {
      return rejectWithValue(err.message || "Xatolik yuz berdi");
    }
  }
);

export const addSubject = createAsyncThunk<Subject[], { title: string; userId: string }>(
    "subjects/add",
    async ({ title, userId }, { rejectWithValue }) => {
      try {
        await api.post("/subjects", { title, created_by: userId }); // ✅ hozirgi user id yuboriladi
        const res = await api.get("/subjects");
        return res.data.data;
      } catch (err: any) {
        return rejectWithValue(err.message || "Fan qo‘shishda xatolik yuz berdi");
      }
    }
  );
  

export const editSubject = createAsyncThunk<Subject[], { id: string; title: string }>(
  "subjects/edit",
  async ({ id, title }, { rejectWithValue }) => {
    try {
      await api.put(`/subjects/${id}`, { title });
      const res = await api.get("/subjects");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Fanni o‘zgartirishda xatolik yuz berdi");
    }
  }
);

export const removeSubject = createAsyncThunk<Subject[], string>(
  "subjects/remove",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/subjects/${id}`);
      const res = await api.get("/subjects");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Fanni o‘chirishda xatolik yuz berdi");
    }
  }
);

const subjectsSlice = createSlice({
  name: "subjects",
  initialState: { items: [], loading: false, error: null } as SubjectsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSubjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadSubjects.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(loadSubjects.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(addSubject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addSubject.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(addSubject.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(editSubject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(editSubject.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(editSubject.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(removeSubject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeSubject.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(removeSubject.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default subjectsSlice.reducer;
