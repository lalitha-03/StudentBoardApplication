import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DataService } from "../services/dataservice";
import { toast } from "react-toastify";

interface CourseState {
  loading: boolean;
  courses: any;
  error: string | undefined;
}

export const getCourseData = createAsyncThunk(
  "data/fetchCoursesData",
  async () => {
    try {
      const response = await DataService.getCourses();
      return response?.data || [];
    } catch (err: any) {
      console.log(err?.message);
      toast.error(err?.message);
      return [];
    }
  }
);

// Create a slice using createSlice
const courseSlice = createSlice({
  name: "course",
  initialState: {
    loading: false,
    courses: [],
    error: undefined,
  } as CourseState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCourseData.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getCourseData.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(getCourseData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload !== undefined ? "Something went wrong" : undefined;
      });
  },
});

export default courseSlice.reducer;
