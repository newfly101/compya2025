export const ADMIN_QUIZ = {
  GET_ALL:        "/admin/quiz",
  CREATE:         "/admin/quiz",
  UPDATE:         (id) => `/admin/quiz/${id}`,
  DELETE:         (id) => `/admin/quiz/${id}`,
  UPLOAD_IMAGE:   "/upload/events",
};

export const ADMIN_QUIZ_ACTIONS = {
  GET_ALL: "GET/admin/quiz",
  CREATE:  "POST/admin/quiz",
  UPDATE:  "PATCH/admin/quiz/update",
  DELETE:  "DELETE/admin/quiz",
};
