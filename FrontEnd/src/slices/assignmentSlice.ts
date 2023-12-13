import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DataService } from "../services/dataservice";
import { toast } from "react-toastify";

interface AssignmentState {
  loading: boolean;
  assignments: any;
  error: string | undefined;
}

export const getAssignmentData = createAsyncThunk(
  "data/fetchAssignmentData",
  async () => {
    try {
      const response = await DataService.getAssignments();
      return response?.data || [];
    } catch (err: any) {
      console.log(err?.message);
      toast.error(err?.message);
      return [];
    }
  }
);

// Create a slice using createSlice
const assignmentSlice = createSlice({
  name: "assignment",
  initialState: {
    loading: false,
    assignments: [],
    error: undefined,
  } as AssignmentState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAssignmentData.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getAssignmentData.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(getAssignmentData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload !== undefined ? "Something went wrong" : undefined;
      });
  },
});

export default assignmentSlice.reducer;
