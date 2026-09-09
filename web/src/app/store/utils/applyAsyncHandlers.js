// @/app/store/utils/applyAsyncHandlers.js
export const applyAsyncHandlers = (builder, thunk, onFulfilled) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading = false;

      onFulfilled(state, action); // fulfilled만 커스텀
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading = false;

      // 이 프로젝트 thunk 는 전부 rejectWithValue(error.message) 로 문자열만 넘긴다.
      // payload 를 먼저 보되, 혹시 객체로 넘어오면 .message 를 쓰고,
      // rejectWithValue 없이 실패한 경우(action.error)에도 대비한다.
      // action.error?.message 를 먼저 읽으면 redux-toolkit 이 채워두는
      // 고정 문구 "Rejected" 가 항상 우선돼서 실제 원인이 안 보였다 — 순서 주의.
      const errorMessage =
        (typeof action.payload === "string" ? action.payload : action.payload?.message) ??
        action.error?.message ??
        "잠시 후 다시 시도해 주세요.";

      // 화면에서 이 문구를 그대로 노출한다(client.js 참고).
      // "[내부 오류]" 접두사는 "로그인이 필요합니다" 같은 사용자 조치 안내에도
      // 똑같이 붙어 오히려 혼란을 줘서 제거한다.
      state.error = errorMessage;
    });
};
