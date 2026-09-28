import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestUserHealthCheck, requestUserLogout } from "@/domains/authentication/store/thunks.js";

// 칸 이름 규칙: app/store/utils/applyAsyncHandlers.js
//   loading/error             → 세션 확인(GET /users/me) 전용
//   mutateLoading/mutateError → 로그아웃 (쓰기)
// initialized = "세션 확인을 시도해 봤다" — AuthProvider 가 이 값이 true 가 되기 전까지 화면을 비워 둔다.
const initialState = {
  user: null,
  userRole: null,
  initialized: false,
  loading: false,
  error: null,
  mutateLoading: false,
  mutateError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    // thunks.js 의 resetAuthSession 이 이 리듀서를 타입 문자열 "auth/clearUser" 로 디스패치한다 —
    // 슬라이스가 thunk 를 import 하는 것이 전 도메인 공통 방향이라 반대 방향 import 는 순환이 된다.
    // 리듀서 이름을 바꾸면 thunks.js 의 문자열도 함께 고쳐야 한다.
    clearUser(state) {
      state.user = null;
      state.userRole = null;
      // 정리됐다는 것은 "확인이 끝났다" 는 뜻이기도 하다 — 인증 실패 경로에서 initialized 가
      // false 로 남으면 AuthProvider 가 화면을 영구히 비워 둔다.
      state.initialized = true;
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
    /* ── 세션 확인 ─────────────────────────────────────────────
       응답을 상태로 옮기는 일은 리듀서가 한다 — thunk 가 setUser 를 디스패치하면
       thunks.js ↔ slices.js 순환 참조가 된다. */
    applyAsyncHandlers(builder, requestUserHealthCheck, (state, action) => {
      const { userRole = null, ...userDetail } = action.payload ?? {};
      state.user = userRole ? userDetail : null;
      state.userRole = userRole;
      state.initialized = true;
    });

    /* ── 로그아웃 ──────────────────────────────────────────────
       성공·실패 어느 쪽이든 thunk 의 finally 가 resetAuthSession(clearUser) 으로
       user/userRole/initialized 를 정리한다. */
    applyAsyncHandlers(builder, requestUserLogout, (state) => {
      state.initialized = true;
    }, "mutate");
  },
});

export const { clearUser, setGuestInitialized } = authSlice.actions;
export default authSlice.reducer;
