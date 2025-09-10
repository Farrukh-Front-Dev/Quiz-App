import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import subjectsReducer from "./slices/subjectsSlice";
import gradesReducer from "./slices/gradesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    grades: gradesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
