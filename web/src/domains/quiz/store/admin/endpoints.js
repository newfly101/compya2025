export const ADMIN_QUIZ = {
  GET_ALL:        "/admin/quiz",
  CREATE:         "/admin/quiz",
  UPDATE:         (id) => `/admin/quiz/${id}`,
  DELETE:         (id) => `/admin/quiz/${id}`,
  // v2 일괄 삭제 — 노출 토글/일괄 숨김은 없다(fun_quiz 에 visible 컬럼 자체가 없음).
  BULK_DELETE:    "/admin/quiz/bulk",
  UPLOAD_IMAGE:   "/upload/events",
};

export const ADMIN_QUIZ_ACTIONS = {
  GET_ALL: "GET/admin/quiz",
  CREATE:  "POST/admin/quiz",
  UPDATE:  "PATCH/admin/quiz/update",
  DELETE:  "DELETE/admin/quiz/delete",
  BULK_DELETE: "DELETE/admin/quiz/bulk",
};
