import { createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH } from "@/store/modules/auth/endpoints.js";
import { fetchHealthCheck, fetchLogout } from "@/store/modules/auth/api.js";

export const requestUserHealthCheck = createAsyncThunk(
  AUTH.HEALTH, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchHealthCheck();
      console.log("requestUserHealthCheck data = ", data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});

export const requestUserLogout = createAsyncThunk(
  AUTH.LOGOUT, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      await fetchLogout();
      console.log("requestUserLogout");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)
