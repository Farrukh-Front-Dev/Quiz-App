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
  subject?: {
    id: string;
    title: string;
  };
}

export interface Subject {
  id: string;
  title: string;
  grades: Grade[];
}

export interface Question {
  id: string;
  question: string;
  options: Option[];
  grade: Grade;
  subject: Subject;
  created_at?: string;
}

// --- STATE ---
interface QuestionsState {
  items: Question[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: QuestionsState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

// --- THUNKS ---

export const fetchQuestions = createAsyncThunk<
  { data: Question[]; total: number; page: number; limit: number },
  { subjectId?: string; gradeId?: string; page?: number; limit?: number } | undefined
>("questions/fetch", async (filters, { rejectWithValue }) => {
  try {
    const params: Record<string, string | number> = {
      page: filters?.page || 1,
      limit: filters?.limit || 100,
    };

    // Backend qaysi parametr nomini kutishini tekshiring
    // Ba'zi backend'lar subjectId/gradeId kutadi, ba'zilari subject/grade
    if (filters?.subjectId) {
      params.subjectId = filters.subjectId; // yoki params.subject
    }
    if (filters?.gradeId) {
      params.gradeId = filters.gradeId; // yoki params.grade
    }

    console.log("📤 Fetching questions with params:", params);
    
    // Agar /subjects/with-test ishlamasa, /questions endpoint'ini sinab ko'ring
    const res = await api.get("/subjects/with-test", { params });
    // yoki: const res = await api.get("/questions", { params });
    
    console.log("📥 API Response:", res.data);
    
    const responseData = res.data?.data;

    if (!responseData || !Array.isArray(responseData.items)) {
      console.warn("⚠️ API noto'g'ri ma'lumot qaytardi:", responseData);
      return { data: [], total: 0, page: 1, limit: 10 };
    }

    const mapped = responseData.items.map((item: any) => ({
      id: item.id,
      question: item.question,
      options: item.options || [],
      grade: {
        id: item.grade?.id,
        title: item.grade?.title,
        subject: item.grade?.subject,
      },
      subject: {
        id: item.grade?.subject?.id,
        title: item.grade?.subject?.title,
      },
    }));

    console.log("✅ Mapped questions:", mapped.length);

    return {
      data: mapped,
      total: responseData.total || mapped.length,
      page: responseData.page || 1,
      limit: responseData.limit || 10,
    };
  } catch (error: any) {
    console.error("❌ fetchQuestions error:", error);
    return rejectWithValue(error.response?.data || "Server error");
  }
});

export const createQuestion = createAsyncThunk<
  Question,
  {
    question: string;
    gradeId: string;
  }
>("questions/create", async (payload, { rejectWithValue }) => {
  try {
    // Backend faqat question va gradeId qabul qiladi (options alohida yaratiladi)
    const res = await api.post("/questions", {
      question: payload.question,
      gradeId: payload.gradeId,
    });
    return res.data.data as Question;
  } catch (error: any) {
    console.error("❌ createQuestion error:", error.response?.data);
    return rejectWithValue(error.response?.data || "Savol yaratishda xatolik!");
  }
});

export const updateQuestion = createAsyncThunk<
  Question,
  {
    id: string;
    question: string;
    gradeId: string;
  }
>("questions/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/questions/${id}`, {
      question: payload.question,
      gradeId: payload.gradeId,
    });
    return res.data.data as Question;
  } catch (error: any) {
    console.error("❌ updateQuestion error:", error.response?.data);
    return rejectWithValue(error.response?.data || "Savol yangilashda xatolik!");
  }
});

export const deleteQuestion = createAsyncThunk<string, string>(
  "questions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/questions/${id}`);
      return id;
    } catch (error: any) {
      console.error("❌ deleteQuestion error:", error.response?.data);
      return rejectWithValue(error.response?.data || "Savol o'chirishda xatolik!");
    }
  }
);

// --- SLICE ---
const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Xatolik!";
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.total += 1;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const idx = state.items.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q.id !== action.payload);
        state.total -= 1;
      });
  },
});

export default questionsSlice.reducer;