import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import courseReducer from "../slices/courseSlice";
import libraryReducer from "../slices/librarySlice";
import assignmentReducer from "../slices/assignmentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    library: libraryReducer,
    assignment: assignmentReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
