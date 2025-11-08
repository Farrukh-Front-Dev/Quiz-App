import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ✅ Type Definitions
export interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  avatar: string;
  izoh?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UsersState {
  items: User[];
  loading: boolean;
  error: string | null;
}

// ✅ DTO Types for API requests
type CreateUserDTO = Omit<User, "id" | "created_at" | "is_active" | "avatar">;
type UpdateUserDTO = Partial<Omit<User, "created_at" | "avatar">> & { id: string };

// ✅ Initial State
const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ Async Thunks with improved error handling

/**
 * Fetch all users from API
 */
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: User[] }>("/users");
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create new user
 */
export const createUser = createAsyncThunk<User, CreateUserDTO, { rejectValue: string }>(
  "users/createUser",
  async (newUser, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: User }>("/users", newUser);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create user";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update existing user
 */
export const updateUser = createAsyncThunk<User, UpdateUserDTO, { rejectValue: string }>(
  "users/updateUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = userData;
      const response = await api.put<{ data: User }>(`/users/${id}`, updateData);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Delete user by ID
 */
export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete user";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // ✅ Manual state reset if needed
    clearError: (state) => {
      state.error = null;
    },
    resetUsers: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error occurred";
      });

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.items.unshift(action.payload); // Add to beginning
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create user";
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const index = state.items.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update user";
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((user) => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete user";
      });
  },
});

// ✅ Export actions and reducer
export const { clearError, resetUsers } = usersSlice.actions;
export default usersSlice.reducer;