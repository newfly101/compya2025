export const ADMIN_USERS = {
  GET_LIST:    "/admin/users",
  GET_DETAIL:  (id) => `/admin/users/${id}`,
  PATCH_ROLE:  (id) => `/admin/users/${id}/role`,
  PATCH_STATUS:(id) => `/admin/users/${id}/status`,
};

export const ADMIN_USER_ACTIONS = {
  GET_LIST:    "GET/admin/users/list",
  GET_DETAIL:  "GET/admin/users/detail",
  PATCH_ROLE:  "PATCH/admin/users/role",
  PATCH_STATUS:"PATCH/admin/users/status",
};
