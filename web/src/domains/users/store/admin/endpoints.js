// 경로의 {id} 자리는 이제 숫자 id 가 아니라 publicId(문자열)를 받는다.
export const ADMIN_USERS = {
  GET_LIST:    "/admin/users",
  PATCH_ROLE:  (publicId) => `/admin/users/${publicId}/role`,
  PATCH_STATUS:(publicId) => `/admin/users/${publicId}/status`,
};

export const ADMIN_USER_ACTIONS = {
  GET_LIST:    "GET/admin/users/list",
  PATCH_ROLE:  "PATCH/admin/users/role",
  PATCH_STATUS:"PATCH/admin/users/status",
};
