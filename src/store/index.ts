import { configureStore } from "@reduxjs/toolkit";
import authReducer, { loadFromStorage } from "./slices/authSlice";
import subjectsReducer from "./slices/subjectsSlice";
import gradesReducer from "./slices/gradesSlice";
import usersReducer from "./slices/usersSlice";
import questionsReducer from "./slices/questionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    grades: gradesReducer,
    users: usersReducer,
    questions: questionsReducer,
  },
});

// 🔑 Sahifa yuklanganda localStorage'dan token va userni yuklaymiz
store.dispatch(loadFromStorage());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
