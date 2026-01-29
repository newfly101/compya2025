import { createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH } from "@/domains/auth/store/endpoints.js";
import { fetchHealthCheck, fetchLogout } from "@/domains/auth/store/api.js";
import { setUser } from "@/domains/auth/store/slices.js";

export const requestUserHealthCheck = createAsyncThunk(
  AUTH.HEALTH, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchHealthCheck();
      const { user, role } = data;
      // console.log("requestUserHealthCheck data = ", data);

      await dispatch(setUser({ user, role }));

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestUserLogout = createAsyncThunk(
  AUTH.LOGOUT, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      await fetchLogout();
      // console.log("requestUserLogout");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
