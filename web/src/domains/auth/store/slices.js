import { createSlice } from "@reduxjs/toolkit";
import { requestUserHealthCheck, requestUserLogout } from "@/domains/auth/store/thunks.js";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  initialized: false, // 🔥 중요
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setUser(state, action) {
      const { user, role } = action.payload;
      state.user = user;
      state.role = role;
      state.isAuthenticated = true;
      state.initialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.initialized = true;
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(requestUserHealthCheck.fulfilled, (state, action) => {
        const { authenticated, user, role } = action.payload;

        state.user = user;
        state.role = role;
        state.isAuthenticated = authenticated;
        state.initialized = true;
      })
      .addCase(requestUserHealthCheck.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(requestUserLogout.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(requestUserLogout.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});

/**
 * export const {} = authSlice.actions;
 * {} 안에는 state를 저장하는 함수 reducer: {} 에 정의된 함수를 사용시 .jsx 에서 사용가능
 */
export const { setUser, clearUser } = authSlice.actions;
/**
 * extraReducers 에서 정의된 .addCase를 사용하기 위해서 주입용으로 내보내는 구문
 * /api/Store.jsx
 */
export default authSlice.reducer;
