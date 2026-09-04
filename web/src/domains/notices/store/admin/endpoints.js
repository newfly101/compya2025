export const ADMIN_NOTICE_ACTIONS = {
  GET_LIST:        "GET/admin/notices/list",
  GET_ONE:         "GET/admin/notices/one",
  INSERT:          "POST/admin/notices/insert",
  UPDATE:          "PATCH/admin/notices/update",
  UPDATE_VISIBLE:  "PATCH/admin/notices/visible",
  UPDATE_PINNED:   "PATCH/admin/notices/pinned",
  DELETE:          "DELETE/admin/notices/delete",
  // v2 일괄 삭제·숨김 — 서버 계약: DELETE .../bulk { ids: [] } / PATCH .../bulk/visible { ids: [], visible }.
  BULK_DELETE:         "DELETE/admin/notices/bulk",
  BULK_UPDATE_VISIBLE: "PATCH/admin/notices/bulk/visible",
};

export const ADMIN_NOTICES = {
  GET_LIST:       "/admin/notices",
  GET_ONE:        (id) => `/admin/notices/${id}`,
  INSERT:         "/admin/notices",
  UPDATE:         (id) => `/admin/notices/${id}`,
  UPDATE_VISIBLE: (id) => `/admin/notices/${id}/visible`,
  UPDATE_PINNED:  (id) => `/admin/notices/${id}/pinned`,
  DELETE:         (id) => `/admin/notices/${id}`,
  // v2 일괄 삭제·숨김 — 서버 재기동 전이라 연결 시 404 가 날 수 있다(배선만 완료).
  BULK_DELETE:         "/admin/notices/bulk",
  BULK_UPDATE_VISIBLE: "/admin/notices/bulk/visible",
};
