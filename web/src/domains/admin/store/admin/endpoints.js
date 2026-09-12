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
