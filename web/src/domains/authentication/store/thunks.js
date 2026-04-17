import { createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH } from "@/domains/authentication/store/endpoints.js";
import { fetchHealthCheck, fetchLogout } from "@/domains/authentication/store/api.js";
import { setUser } from "@/domains/authentication/store/slices.js";

export const requestUserHealthCheck = createAsyncThunk(
  AUTH.HEALTH, async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await fetchHealthCheck();
      console.log("health check: ",data);

      const { userRole, ...userDetail } = data;

      await dispatch(setUser({ userDetail, userRole }));

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestUserLogout = createAsyncThunk(
  AUTH.LOGOUT, async (_, { rejectWithValue }) => {
    try {
      await fetchLogout();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
