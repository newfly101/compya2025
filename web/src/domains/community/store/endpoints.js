export const ADMIN_COMMUNITY = {
  // boards
  BOARD_LIST: "/community/admin/boards",
  CREATE_BOARD: "/community/admin/boards",
  UPDATE_BOARD: (id) => `/community/admin/boards/${id}`,
  // posts
  POST_LIST: "/community/admin/posts",
  CREATE_POST: "/community/admin/posts",
  UPDATE_POST: (id) => `/community/admin/posts/${id}`,
}
export const ADMIN_COMMUNITY_ACTIONS = {
  // boards
  BOARD_LIST: "/community/admin/boards",
  CREATE_BOARD: "/community/admin/boards/create",
  UPDATE_BOARD: "/community/admin/boards/${id}",
  // posts
  POST_LIST: "/community/admin/posts",
  CREATE_POST: "/community/admin/posts/create",
  UPDATE_POST: "/community/admin/posts/${id}",
}
