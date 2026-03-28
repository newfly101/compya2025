export const ADMIN_QUIZ = {
  GET_ALL:        "/admin/quiz-answers",
  CREATE:         "/admin/quiz-answers",
  UPDATE:         (id) => `/admin/quiz-answers/${id}`,
  UPDATE_VISIBLE: (id) => `/admin/quiz-answers/${id}/visible`,
  UPLOAD_IMAGE:   "/upload/events",
};

export const ADMIN_QUIZ_ACTIONS = {
  GET_ALL:        "GET/admin/quiz-answers",
  CREATE:         "POST/admin/quiz-answers",
  UPDATE:         "PATCH/admin/quiz-answers/update",
  UPDATE_VISIBLE: "PATCH/admin/quiz-answers/visible",
};
