import { createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH } from "@/domains/authentication/store/endpoints.js";
import { fetchHealthCheck, fetchLogout } from "@/domains/authentication/store/api.js";
import { setUser } from "@/domains/authentication/store/slices.js";
import { setAuthSessionMarker, clearAuthSessionMarker } from "@/infra/http/authSessionMarker.js";

export const requestUserHealthCheck = createAsyncThunk(
  AUTH.HEALTH, async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await fetchHealthCheck();

      const { userRole, ...userDetail } = data;

      await dispatch(setUser({ userDetail, userRole }));
      setAuthSessionMarker();

      return data;
    } catch (error) {
      clearAuthSessionMarker();
      return rejectWithValue(error.message);
    }
  });

export const requestUserLogout = createAsyncThunk(
  AUTH.LOGOUT, async (_, { rejectWithValue }) => {
    try {
      await fetchLogout();
    } catch (error) {
      return rejectWithValue(error.message);
    } finally {
      clearAuthSessionMarker();
    }
  },
);
