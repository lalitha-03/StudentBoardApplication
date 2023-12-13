import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DataService } from "../services/dataservice";
import { toast } from "react-toastify";

interface LibraryState {
  loading: boolean;
  library: any;
  error: string | undefined;
}

export const getLibraryData = createAsyncThunk(
  "data/fetchLibraryData",
  async () => {
    try {
      const response = await DataService.getBooks();
      return response?.data || [];
    } catch (err: any) {
      console.log(err?.message);
      toast.error(err?.message);
      return [];
    }
  }
);

// Create a slice using createSlice
const librarySlice = createSlice({
  name: "library",
  initialState: {
    loading: false,
    library: [],
    error: undefined,
  } as LibraryState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLibraryData.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getLibraryData.fulfilled, (state, action) => {
        state.loading = false;
        state.library = action.payload;
      })
      .addCase(getLibraryData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload !== undefined ? "Something went wrong" : undefined;
      });
  },
});

export default librarySlice.reducer;
