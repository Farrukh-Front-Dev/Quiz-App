import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api"; // ✅ axios o‘rniga api ishlatyapmiz

export interface User {
  avatar: string;
  id: string;
  name: string;
  surname: string;
  phone: string;
  izoh?: string | null;
  is_active: boolean;
  created_at: string;
}

interface UsersState {
  items: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ READ – Usersni olish
export const fetchUsers = createAsyncThunk<User[]>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users");
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ CREATE – User qo‘shish
export const createUser = createAsyncThunk<User, Omit<User, "id" | "created_at" | "is_active">>(
  "users/createUser",
  async (newUser, { rejectWithValue }) => {
    try {
      const res = await api.post("/users", newUser);
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ UPDATE – Userni yangilash
export const updateUser = createAsyncThunk<User, Partial<User>>(
  "users/updateUser",
  async (user, { rejectWithValue }) => {
    try {
      const res = await api.put(`/users/${user.id}`, user);
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ DELETE – Userni o‘chirish
export const deleteUser = createAsyncThunk<string, string>(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.items.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.items.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
