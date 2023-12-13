import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DataService } from "../services/dataservice";
import { toast } from "react-toastify";

interface AuthState {
  loading: boolean;
  user: any;
  authenticated: boolean;
  error: string | undefined;
}

export const loginUser = createAsyncThunk(
  "data/fetchLoginData",
  async (data: any) => {
    console.log(data);
    try {
      const response = await DataService.loginService(data);
      console.log(response?.data);
      localStorage.setItem("user", JSON.stringify(response?.data));
      return response?.data;
    } catch (err: any) {
      console.log(err?.message);
      toast.error(err?.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "data/fetchRegisterData",
  async (data: any) => {
    console.log(data);
    try {
      const response = await DataService.registerService(data);
      console.log(response);
      toast.success(response?.msg);
    } catch (err: any) {
      console.log(err?.message);
      toast.error(err?.message);
      return null;
    }
  }
);

// Create a slice using createSlice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    user: null,
    authenticated: false,
    error: undefined,
  } as AuthState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.authenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.authenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload !== undefined ? "Something went wrong" : undefined;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload !== undefined ? "Something went wrong" : undefined;
      });
  },
});

export const { clearUser } = authSlice.actions;

export default authSlice.reducer;
