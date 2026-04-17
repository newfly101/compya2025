import { createSlice } from "@reduxjs/toolkit";
import { requestUserHealthCheck, requestUserLogout } from "@/domains/authentication/store/thunks.js";

const initialState = {
  user: null,
  userRole: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setUser(state, action) {
      const { userDetail, useRole } = action.payload;
      state.user = userDetail;
      state.userRole = useRole;
      state.initialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.userRole = null;
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(requestUserHealthCheck.fulfilled, (state) => {
        state.initialized = true;
      })
      .addCase(requestUserHealthCheck.rejected, (state) => {
        state.user = null;
        state.userRole = null;
        state.initialized = true;
      })
      .addCase(requestUserLogout.fulfilled, (state) => {
        state.user = null;
        state.userRole = null;
        state.initialized = true;
      })
      .addCase(requestUserLogout.rejected, (state) => {
        state.user = null;
        state.userRole = null;
        state.initialized = true;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
