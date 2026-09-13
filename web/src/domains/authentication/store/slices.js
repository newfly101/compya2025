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
      const { userDetail, userRole } = action.payload;
      state.user = userDetail;
      state.userRole = userRole;
      state.initialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.userRole = null;
    },
    // 로그인한 적 없는 방문자(세션 마커 없음) — /users/me 호출 자체를 건너뛰고
    // 곧바로 "확인 완료, 비로그인" 상태로 표시한다.
    setGuestInitialized(state) {
      state.user = null;
      state.userRole = null;
      state.initialized = true;
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

export const { setUser, clearUser, setGuestInitialized } = authSlice.actions;
export default authSlice.reducer;
