import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer, { loadFromStorage } from "./slices/authSlice";
import subjectsReducer from "./slices/subjectsSlice";
import gradesReducer from "./slices/gradesSlice";
import usersReducer from "./slices/usersSlice";
import questionsReducer from "./slices/questionsSlice";
import optionsReducer from "./slices/optionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    grades: gradesReducer,
    users: usersReducer,
    questions: questionsReducer,
    options: optionsReducer, // ✅ qo‘shilgan
  },
});

// LocalStorage dan userni yuklash
store.dispatch(loadFromStorage());

// 🔹 Typed Redux types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Custom typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
