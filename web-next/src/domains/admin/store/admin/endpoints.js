// 컨텐츠 캐시 동기화 — 운영자가 DB 를 직접 고쳐도 서버 메모리 캐시엔 옛 값이 남는 문제를
// 재시작 없이 풀기 위한 API. 대상 목록은 서버가 내려주는 대로 쓴다(FE 하드코딩 금지).
export const ADMIN_CACHE_SYNC = {
  GET_TARGETS: "/admin/cache-sync/targets",
  SYNC_ONE:    (id) => `/admin/cache-sync/${id}/sync`,
  SYNC_ALL:    "/admin/cache-sync/sync-all",
};

export const ADMIN_CACHE_SYNC_ACTIONS = {
  GET_TARGETS: "GET/admin/cache-sync/targets",
  SYNC_ONE:    "POST/admin/cache-sync/sync-one",
  SYNC_ALL:    "POST/admin/cache-sync/sync-all",
};

// 관리자 통계 탭 — 방문·이벤트 요약. range 는 TODAY|WEEK|MONTH|CUSTOM(from/to 동반).
export const ADMIN_ANALYTICS = {
  GET_SUMMARY: (range, from, to) => {
    const params = new URLSearchParams({ range });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/admin/analytics/summary?${params.toString()}`;
  },
  // 일별/시간대별 추이 — range 개념 없이 항상 from/to 명시(요약과 독립된 기간).
  GET_TREND:   (from, to, granularity) =>
    `/admin/analytics/trend?from=${from}&to=${to}&granularity=${granularity}`,
  AGGREGATE:   (date) => `/admin/analytics/aggregate?date=${date}`,
};

export const ADMIN_ANALYTICS_ACTIONS = {
  GET_SUMMARY: "GET/admin/analytics/summary",
  GET_TREND:   "GET/admin/analytics/trend",
  AGGREGATE:   "POST/admin/analytics/aggregate",
};
