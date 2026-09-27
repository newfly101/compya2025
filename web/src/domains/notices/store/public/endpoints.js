export const NOTICE_ACTIONS = {
  GET_NOTICES: "GET/notices/list",
  GET_NOTICE_DETAIL: "GET/notices/detail",
};

export const NOTICES = {
  GET_NOTICES: "/notices",
  GET_NOTICE_DETAIL: (id) => `/notices/${id}`,
};
