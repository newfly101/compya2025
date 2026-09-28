// @/app/store/utils/applyAsyncHandlers.js
//
// ── 칸(scope) 이름 규칙 — 전 도메인 공통 ──────────────────────────────────────
// 슬라이스마다 이름을 다르게 지으면 "요청끼리 칸을 빼앗는" 지금 문제가 그대로
// 재생산된다. 그래서 아래 4개 어휘만 쓴다. 새 칸이 필요하면 여기에 추가한다.
//
//   scope          필드                             쓰는 요청
//   "list"(기본)   loading       / error            이 슬라이스의 주 목록을 채우는 조회
//   "public"       publicLoading / publicError      공개 화면 조회(관리자 조회와 같은 슬라이스일 때)
//   "detail"       detailLoading / detailError      단건 상세 조회(목록과 다른 화면이 소비할 때)
//   "mutate"       mutateLoading / mutateError      생성·수정·삭제·토글·일괄 (쓰기)
//
// 기본값이 "list" 인 이유 — 단일 요청 슬라이스(home·uploads·players 등)는 이미
// loading/error 한 쌍으로 충분해서 호출부를 고칠 필요가 없다.
//
// 쓰기가 조회 칸을 밟으면 이렇게 깨진다: 목록 스켈레톤이 깜빡이고, 저장 실패 문구가
// 목록 오류 화면으로 뜨고, 관리자 셸 건수(useAdminCounts)는 error 가 남아 있는 동안
// 영구히 "–" 로 표시된다.
const fieldsOf = (scope) =>
  scope === "list" ? ["loading", "error"] : [`${scope}Loading`, `${scope}Error`];

export const applyAsyncHandlers = (builder, thunk, onFulfilled, scope = "list") => {
  const [loadingKey, errorKey] = fieldsOf(scope);

  builder
    .addCase(thunk.pending, (state) => {
      state[loadingKey] = true;
      state[errorKey] = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[loadingKey] = false;

      onFulfilled(state, action); // fulfilled만 커스텀
    })
    .addCase(thunk.rejected, (state, action) => {
      state[loadingKey] = false;

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
      state[errorKey] = errorMessage;
    });
};
