export const ADMIN_NOTICE_ACTIONS = {
  GET_LIST:        "GET/admin/notices/list",
  INSERT:          "POST/admin/notices/insert",
  UPDATE:          "PATCH/admin/notices/update",
  UPDATE_VISIBLE:  "PATCH/admin/notices/visible",
  UPDATE_PINNED:   "PATCH/admin/notices/pinned",
  DELETE:          "DELETE/admin/notices/delete",
};

export const ADMIN_NOTICES = {
  GET_LIST:       "/admin/notices",
  INSERT:         "/admin/notices",
  UPDATE:         (id) => `/admin/notices/${id}`,
  UPDATE_VISIBLE: (id) => `/admin/notices/${id}/visible`,
  UPDATE_PINNED:  (id) => `/admin/notices/${id}/pinned`,
  DELETE:         (id) => `/admin/notices/${id}`,
};
